import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Users, UserPlus, Mail, MapPin, Globe, Building,
  CheckCircle, XCircle, Clock, FileText, Activity, Crown, Loader2,
  Trash2, Ban, UserX, RotateCcw, Search, Eye, ClipboardList, Copy, Check,
} from 'lucide-react';
import { useRealtimeTable } from '@/hooks/use-realtime';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import DocumentList from '@/components/user/DocumentList';
import StatusBadge from '@/components/common/StatusBadge';

interface County { id: string; name: string; }
interface Constituency { id: string; name: string; county_id: string; }
interface Ward { id: string; name: string; constituency_id: string; }

const SuperAdminDashboard = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'chief'>('admin');
  const [inviteLevel, setInviteLevel] = useState('');
  const [selectedCountyId, setSelectedCountyId] = useState('');
  const [selectedConstituencyId, setSelectedConstituencyId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [sending, setSending] = useState(false);

  const [counties, setCounties] = useState<County[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Student Lookup
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{ code: string; email: string; expires_at: string } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    supabase.from('counties').select('*').order('name').then(({ data }) => setCounties(data || []));
  }, []);

  useEffect(() => {
    setSelectedConstituencyId(''); setSelectedWardId(''); setConstituencies([]); setWards([]);
    if (!selectedCountyId) return;
    supabase.from('constituencies').select('*').eq('county_id', selectedCountyId).order('name').then(({ data }) => setConstituencies(data || []));
  }, [selectedCountyId]);

  useEffect(() => {
    setSelectedWardId(''); setWards([]);
    if (!selectedConstituencyId) return;
    supabase.from('wards').select('*').eq('constituency_id', selectedConstituencyId).order('name').then(({ data }) => setWards(data || []));
  }, [selectedConstituencyId]);

  const fetchData = async () => {
    setLoading(true);
    const [invRes, studRes, auditRes, profilesRes, rolesRes, reqRes] = await Promise.all([
      supabase.from('invitations').select('*').order('created_at', { ascending: false }),
      supabase.from('student_profiles').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('*'),
      supabase.from('admin_requests').select('*').order('created_at', { ascending: false }),
    ]);

    setInvitations(invRes.data || []);
    setStudents(studRes.data || []);
    setAuditLogs(auditRes.data || []);
    setAdminRequests((reqRes.data as any[]) || []);

    const roles = rolesRes.data || [];
    const profiles = profilesRes.data || [];
    const adminRoles = roles.filter(r => r.role === 'admin' || r.role === 'chief');
    const adminList = adminRoles.map(r => {
      const profile = profiles.find(p => p.user_id === r.user_id);
      return { ...r, profile };
    });
    setAdmins(adminList);
    setAllUsers(profiles);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRealtimeUpdate = useCallback(() => { fetchData(); }, []);
  useRealtimeTable('documents', handleRealtimeUpdate);
  useRealtimeTable('comments', handleRealtimeUpdate);
  useRealtimeTable('invitations', handleRealtimeUpdate);
  useRealtimeTable('user_roles', handleRealtimeUpdate);
  useRealtimeTable('profiles', handleRealtimeUpdate);

  const getSelectedNames = () => {
    const county = counties.find(c => c.id === selectedCountyId)?.name || '';
    const constituency = constituencies.find(c => c.id === selectedConstituencyId)?.name || '';
    const ward = wards.find(w => w.id === selectedWardId)?.name || '';
    return { county, constituency, ward };
  };

  const handleGenerateCode = async () => {
    if (!inviteEmail || !selectedCountyId) {
      toast({ title: 'Missing fields', description: 'Fill in email and county.', variant: 'destructive' }); return;
    }
    if (inviteRole === 'admin' && !inviteLevel) {
      toast({ title: 'Select admin level', variant: 'destructive' }); return;
    }
    if (inviteRole === 'chief' && (!selectedConstituencyId || !selectedWardId)) {
      toast({ title: 'Chiefs require constituency and ward', variant: 'destructive' }); return;
    }
    const effectiveLevel = inviteRole === 'chief' ? 'ward' : inviteLevel;
    if (effectiveLevel === 'constituency' && !selectedConstituencyId) {
      toast({ title: 'Missing constituency', variant: 'destructive' }); return;
    }
    if (effectiveLevel === 'ward' && (!selectedConstituencyId || !selectedWardId)) {
      toast({ title: 'Missing constituency/ward', variant: 'destructive' }); return;
    }

    const { county, constituency, ward } = getSelectedNames();
    setSending(true);
    const { data, error } = await supabase.functions.invoke('generate-access-code', {
      body: { email: inviteEmail, role: inviteRole, admin_level: inviteRole === 'chief' ? 'ward' : inviteLevel, county, constituency, ward },
    });
    setSending(false);

    if (error || data?.error) {
      toast({ title: 'Failed to generate code', description: data?.error || error?.message, variant: 'destructive' });
    } else {
      toast({
        title: '✅ Access Code Generated!',
        description: `Code: ${data.code} — Send this to ${data.email}. Expires in 15 minutes.`,
        duration: 30000,
      });
      navigator.clipboard?.writeText(data.code);
      setInviteEmail(''); setInviteRole('admin'); setInviteLevel(''); setSelectedCountyId('');
      fetchData();
    }
  };

  const handleDeleteInvitation = async (invId: string) => {
    const { error } = await supabase.from('invitations').delete().eq('id', invId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Invitation deleted' });
      fetchData();
    }
  };

  const handleRevokeInvitation = async (invId: string) => {
    const { error } = await supabase.from('invitations').update({ status: 'expired' }).eq('id', invId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Invitation revoked' });
      fetchData();
    }
  };

  const handleUserAction = async (targetUserId: string, action: 'suspend' | 'ban' | 'activate' | 'delete') => {
    setActionLoading(targetUserId);
    const { data, error } = await supabase.functions.invoke('manage-user', {
      body: { action, target_user_id: targetUserId },
    });
    setActionLoading(null);

    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || error?.message, variant: 'destructive' });
    } else {
      toast({ title: `User ${action === 'activate' ? 'activated' : action === 'delete' ? 'deleted' : action + 'ed'} successfully` });
      fetchData();
    }
  };

  const handleApproveRequest = async (req: any) => {
    // Pre-fill invite form with request data and generate code
    setInviteEmail(req.email);
    setInviteRole(req.requested_level === 'ward' ? 'chief' : 'admin');
    if (req.requested_level !== 'ward') setInviteLevel(req.requested_level);
    // Mark request as approved
    await supabase.from('admin_requests').update({ status: 'approved', reviewed_by: user?.id, reviewed_at: new Date().toISOString() } as any).eq('id', req.id);
    toast({ title: 'Request approved', description: 'Now generate an access code in the Invite tab for this user.' });
    fetchData();
  };

  const handleRejectRequest = async (reqId: string) => {
    await supabase.from('admin_requests').update({ status: 'rejected', reviewed_by: user?.id, reviewed_at: new Date().toISOString() } as any).eq('id', reqId);
    toast({ title: 'Request rejected' });
    fetchData();
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lookup-student?education_id=${encodeURIComponent(lookupId.trim())}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    });
    const result = await res.json();
    setLookupLoading(false);
    if (result.error) {
      toast({ title: 'Not found', description: result.error, variant: 'destructive' });
    } else {
      setLookupResult(result);
    }
  };

  const showConstituency = inviteLevel === 'constituency' || inviteLevel === 'ward';
  const showWard = inviteLevel === 'ward';

  if (loading) {
    return (
      <DashboardLayout title="Super Admin Dashboard">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const pendingRequests = adminRequests.filter(r => r.status === 'pending');
  const stats = {
    totalUsers: allUsers.length,
    totalAdmins: admins.length,
    totalStudents: students.length,
    pendingRequests: pendingRequests.length,
  };

  return (
    <DashboardLayout title="Super Admin Dashboard">
      {/* Banner */}
      <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10">
        <Crown className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-primary">Full system access across Kenya</span>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users },
          { label: 'Admins & Chiefs', value: stats.totalAdmins, icon: Shield },
          { label: 'Student Applications', value: stats.totalStudents, icon: FileText },
          { label: 'Pending Requests', value: stats.pendingRequests, icon: ClipboardList },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="invite">
        <TabsList className="mb-6 rounded-xl flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="invite" className="gap-1.5 rounded-lg"><UserPlus className="h-3.5 w-3.5" /> Invite</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5 rounded-lg">
            <ClipboardList className="h-3.5 w-3.5" /> Requests
            {pendingRequests.length > 0 && <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">{pendingRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-1.5 rounded-lg"><Shield className="h-3.5 w-3.5" /> Staff</TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 rounded-lg"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="invitations" className="gap-1.5 rounded-lg"><Mail className="h-3.5 w-3.5" /> History</TabsTrigger>
          <TabsTrigger value="lookup" className="gap-1.5 rounded-lg"><Search className="h-3.5 w-3.5" /> Lookup</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 rounded-lg"><Activity className="h-3.5 w-3.5" /> Audit</TabsTrigger>
        </TabsList>

        {/* INVITE TAB */}
        <TabsContent value="invite">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-primary" /> Generate Access Code
              </CardTitle>
              <CardDescription>Generate a secure 6-digit access code for a new staff member. Share the code manually — it expires in 15 minutes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label className="text-sm">Email Address</Label>
                <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="staff@example.com" type="email" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Role</Label>
                <Select value={inviteRole} onValueChange={v => { setInviteRole(v as 'admin' | 'chief'); setInviteLevel(''); setSelectedCountyId(''); }}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin"><div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Administrator</div></SelectItem>
                    <SelectItem value="chief"><div className="flex items-center gap-2"><Crown className="h-4 w-4" /> Chief</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inviteRole === 'admin' && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Admin Level</Label>
                  <Select value={inviteLevel} onValueChange={v => { setInviteLevel(v); setSelectedCountyId(''); }}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select admin level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="county"><div className="flex items-center gap-2"><Globe className="h-4 w-4" /> County Admin</div></SelectItem>
                      <SelectItem value="constituency"><div className="flex items-center gap-2"><Building className="h-4 w-4" /> Constituency Admin</div></SelectItem>
                      <SelectItem value="ward"><div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Ward Admin</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(inviteRole === 'chief' || (inviteRole === 'admin' && inviteLevel)) && (
                <div className="space-y-1.5">
                  <Label className="text-sm">County</Label>
                  <Select value={selectedCountyId} onValueChange={setSelectedCountyId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select county" /></SelectTrigger>
                    <SelectContent>{counties.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {(inviteRole === 'chief' || showConstituency) && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Constituency</Label>
                  <Select value={selectedConstituencyId} onValueChange={setSelectedConstituencyId} disabled={!selectedCountyId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={selectedCountyId ? 'Select constituency' : 'Select county first'} /></SelectTrigger>
                    <SelectContent>{constituencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {(inviteRole === 'chief' || showWard) && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Ward</Label>
                  <Select value={selectedWardId} onValueChange={setSelectedWardId} disabled={!selectedConstituencyId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={selectedConstituencyId ? 'Select ward' : 'Select constituency first'} /></SelectTrigger>
                    <SelectContent>{wards.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={handleGenerateCode} disabled={sending} className="w-full h-11 rounded-xl">
                {sending ? 'Generating Code...' : `Generate ${inviteRole === 'chief' ? 'Chief' : 'Admin'} Access Code`}
              </Button>
              <p className="text-xs text-muted-foreground">🔒 The code expires in 15 minutes and can only be used once. Share it securely with the invitee.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADMIN REQUESTS TAB */}
        <TabsContent value="requests">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4 text-primary" /> Admin Access Requests
              </CardTitle>
              <CardDescription>Review requests from people who want to become administrators.</CardDescription>
            </CardHeader>
            <CardContent>
              {adminRequests.length === 0 ? (
                <div className="text-center py-16">
                  <ClipboardList className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No admin requests yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {adminRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{req.name}</p>
                          <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize rounded-full text-xs">
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{req.email}{req.phone ? ` · ${req.phone}` : ''}</p>
                        <p className="text-xs text-muted-foreground">
                          Level: {req.requested_level} · {req.county || '—'}
                          {req.constituency ? ` > ${req.constituency}` : ''}
                          {req.ward ? ` > ${req.ward}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(req.created_at).toLocaleString()}</p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="rounded-xl gap-1" onClick={() => handleApproveRequest(req)}>
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl gap-1" onClick={() => handleRejectRequest(req.id)}>
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAFF TAB */}
        <TabsContent value="admins">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" /> Active Staff (Admins & Chiefs)
              </CardTitle>
              <CardDescription>Manage staff accounts — suspend, ban, or permanently delete.</CardDescription>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No admins yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {admins.map((a, i) => {
                    const status = a.profile?.user_status || 'active';
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {a.profile?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{a.profile?.name || 'Unknown'}</p>
                              {status !== 'active' && (
                                <Badge variant="destructive" className="text-[10px] rounded-full capitalize">{status}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {a.profile?.admin_level ? `${a.profile.admin_level} admin` : a.role} ·
                              {a.profile?.county && ` ${a.profile.county}`}
                              {a.profile?.constituency && ` > ${a.profile.constituency}`}
                              {a.profile?.ward && ` > ${a.profile.ward}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="capitalize rounded-full text-xs mr-2">{a.role}</Badge>
                          {status === 'active' && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUserAction(a.user_id, 'suspend')} disabled={actionLoading === a.user_id}>
                                <UserX className="h-3.5 w-3.5 text-amber-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUserAction(a.user_id, 'ban')} disabled={actionLoading === a.user_id}>
                                <Ban className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </>
                          )}
                          {(status === 'suspended' || status === 'banned') && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUserAction(a.user_id, 'activate')} disabled={actionLoading === a.user_id}>
                              <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={actionLoading === a.user_id}>
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Permanently Delete User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove {a.profile?.name}'s account and all associated data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction(a.user_id, 'delete')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALL USERS TAB */}
        <TabsContent value="users">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" /> All Users (Students)
              </CardTitle>
              <CardDescription>Manage all registered users — suspend, ban, or delete.</CardDescription>
            </CardHeader>
            <CardContent>
              {allUsers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No users yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers.map(u => {
                    const status = u.user_status || 'active';
                    if (u.user_id === user?.id) return null;
                    return (
                      <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{u.name}</p>
                              {status !== 'active' && (
                                <Badge variant="destructive" className="text-[10px] rounded-full capitalize">{status}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{u.county}{u.constituency ? ` > ${u.constituency}` : ''}{u.ward ? ` > ${u.ward}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {status === 'active' && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUserAction(u.user_id, 'suspend')} disabled={actionLoading === u.user_id} title="Suspend">
                                <UserX className="h-3.5 w-3.5 text-amber-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUserAction(u.user_id, 'ban')} disabled={actionLoading === u.user_id} title="Ban">
                                <Ban className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </>
                          )}
                          {(status === 'suspended' || status === 'banned') && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUserAction(u.user_id, 'activate')} disabled={actionLoading === u.user_id} title="Reactivate">
                              <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={actionLoading === u.user_id} title="Delete permanently">
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Permanently Delete User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove {u.name}'s account. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction(u.user_id, 'delete')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVITATIONS TAB */}
        <TabsContent value="invitations">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-primary" /> Invitation History
              </CardTitle>
              <CardDescription>View, revoke, or delete past invitations.</CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-16">
                  <Mail className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invitations.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60">
                      <div>
                        <p className="font-medium text-sm">{inv.invited_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.admin_level} admin · {inv.county}
                          {inv.constituency && ` > ${inv.constituency}`}
                          {inv.ward && ` > ${inv.ward}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(inv.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={inv.status === 'used' ? 'default' : inv.status === 'expired' ? 'destructive' : 'secondary'} className="capitalize rounded-full text-xs">
                          {inv.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {inv.status === 'used' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {inv.status === 'expired' && <XCircle className="h-3 w-3 mr-1" />}
                          {inv.status}
                        </Badge>
                        {inv.status === 'pending' && (
                          <Button size="sm" variant="ghost" className="h-8 text-amber-600 text-xs" onClick={() => handleRevokeInvitation(inv.id)}>
                            Revoke
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invitation?</AlertDialogTitle>
                              <AlertDialogDescription>Remove this invitation record permanently.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteInvitation(inv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOOKUP TAB */}
        <TabsContent value="lookup">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-primary" /> Student Lookup
              </CardTitle>
              <CardDescription>Enter an Education ID or scan a QR code to view student documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 max-w-md mb-6">
                <Input
                  value={lookupId}
                  onChange={e => setLookupId(e.target.value)}
                  placeholder="Enter Education ID (e.g. EDU-A1B2C3D4)"
                  className="h-11 rounded-xl"
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                />
                <Button onClick={handleLookup} disabled={lookupLoading || !lookupId.trim()} className="h-11 rounded-xl px-6">
                  {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {lookupResult && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-secondary/60">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{lookupResult.student.student_name}</h3>
                        <p className="text-sm text-muted-foreground">{lookupResult.student.school_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lookupResult.profile?.ward}, {lookupResult.profile?.constituency}, {lookupResult.profile?.county}
                        </p>
                      </div>
                      <StatusBadge status={lookupResult.student.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded-lg bg-background">
                        <span className="text-xs text-muted-foreground">Education ID</span>
                        <p className="font-medium text-primary">{lookupResult.student.education_id}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-background">
                        <span className="text-xs text-muted-foreground">Birth Cert</span>
                        <p className="font-medium">{lookupResult.student.birth_cert_number || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <DocumentList studentId={lookupResult.student.id} />
                  {lookupResult.comments?.length > 0 && (
                    <Card className="rounded-2xl shadow-sm">
                      <CardHeader><CardTitle className="text-sm">Comments</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {lookupResult.comments.map((c: any) => (
                          <div key={c.id} className="p-3 rounded-xl bg-secondary/60">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <Badge variant="outline" className="text-[10px] capitalize rounded-full">{c.role}</Badge>
                              <span>{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm">{c.comment_text}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT TAB */}
        <TabsContent value="audit">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" /> Audit Logs
              </CardTitle>
              <CardDescription>Recent system actions</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-16">
                  <Activity className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No audit logs yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 text-sm">
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.actor_role && <span className="capitalize">{log.actor_role} · </span>}
                          {log.target_type && <span>{log.target_type} · </span>}
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
