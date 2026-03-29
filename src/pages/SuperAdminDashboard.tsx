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
} from 'lucide-react';
import { useRealtimeTable } from '@/hooks/use-realtime';

interface County { id: string; name: string; }
interface Constituency { id: string; name: string; county_id: string; }
interface Ward { id: string; name: string; constituency_id: string; }

const SuperAdminDashboard = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [inviteEmail, setInviteEmail] = useState('');
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
  const [loading, setLoading] = useState(true);

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
    const [invRes, studRes, auditRes, profilesRes, rolesRes] = await Promise.all([
      supabase.from('invitations').select('*').order('created_at', { ascending: false }),
      supabase.from('student_profiles').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('*'),
    ]);

    setInvitations(invRes.data || []);
    setStudents(studRes.data || []);
    setAuditLogs(auditRes.data || []);

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

  const getSelectedNames = () => {
    const county = counties.find(c => c.id === selectedCountyId)?.name || '';
    const constituency = constituencies.find(c => c.id === selectedConstituencyId)?.name || '';
    const ward = wards.find(w => w.id === selectedWardId)?.name || '';
    return { county, constituency, ward };
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteLevel || !selectedCountyId) {
      toast({ title: 'Missing fields', description: 'Fill in email, admin level, and county.', variant: 'destructive' }); return;
    }
    if (inviteLevel === 'constituency' && !selectedConstituencyId) {
      toast({ title: 'Missing constituency', variant: 'destructive' }); return;
    }
    if (inviteLevel === 'ward' && (!selectedConstituencyId || !selectedWardId)) {
      toast({ title: 'Missing constituency/ward', variant: 'destructive' }); return;
    }

    const { county, constituency, ward } = getSelectedNames();
    setSending(true);
    const { data, error } = await supabase.functions.invoke('send-admin-invite', {
      body: { email: inviteEmail, admin_level: inviteLevel, county, constituency, ward },
    });
    setSending(false);

    if (error || data?.error) {
      toast({ title: 'Failed to send invite', description: data?.error || error?.message, variant: 'destructive' });
    } else {
      const inviteLink = `${window.location.origin}/accept-invite?token=${data.token}`;
      toast({ title: 'Invitation created!', description: 'The invite link has been copied to your clipboard.' });
      navigator.clipboard?.writeText(inviteLink);
      setInviteEmail(''); setInviteLevel(''); setSelectedCountyId('');
      fetchData();
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

  const stats = {
    totalUsers: allUsers.length,
    totalAdmins: admins.length,
    totalStudents: students.length,
    pendingInvites: invitations.filter(i => i.status === 'pending').length,
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
          { label: 'Pending Invites', value: stats.pendingInvites, icon: Mail },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center">
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
        <TabsList className="mb-6 rounded-xl">
          <TabsTrigger value="invite" className="gap-1.5 rounded-lg"><UserPlus className="h-3.5 w-3.5" /> Invite</TabsTrigger>
          <TabsTrigger value="admins" className="gap-1.5 rounded-lg"><Shield className="h-3.5 w-3.5" /> Admins</TabsTrigger>
          <TabsTrigger value="invitations" className="gap-1.5 rounded-lg"><Mail className="h-3.5 w-3.5" /> Invitations</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 rounded-lg"><Activity className="h-3.5 w-3.5" /> Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="invite">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-primary" /> Invite New Admin
              </CardTitle>
              <CardDescription>Send a secure, time-bound invitation to onboard a new administrator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label className="text-sm">Email Address</Label>
                <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="admin@example.com" type="email" className="h-11 rounded-xl" />
              </div>
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

              {inviteLevel && (
                <div className="space-y-1.5">
                  <Label className="text-sm">County</Label>
                  <Select value={selectedCountyId} onValueChange={setSelectedCountyId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select county" /></SelectTrigger>
                    <SelectContent>{counties.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {showConstituency && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Constituency</Label>
                  <Select value={selectedConstituencyId} onValueChange={setSelectedConstituencyId} disabled={!selectedCountyId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={selectedCountyId ? 'Select constituency' : 'Select county first'} /></SelectTrigger>
                    <SelectContent>{constituencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {showWard && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Ward</Label>
                  <Select value={selectedWardId} onValueChange={setSelectedWardId} disabled={!selectedConstituencyId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={selectedConstituencyId ? 'Select ward' : 'Select constituency first'} /></SelectTrigger>
                    <SelectContent>{wards.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={handleSendInvite} disabled={sending} className="w-full h-11 rounded-xl">
                {sending ? 'Sending...' : 'Send Invitation'}
              </Button>
              <p className="text-xs text-muted-foreground">Invitation link expires in 1 hour and can only be used once.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" /> Active Admins & Chiefs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No admins yet. Send an invitation to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {admins.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/8 flex items-center justify-center text-primary font-semibold text-sm">
                          {a.profile?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{a.profile?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{a.profile?.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.profile?.admin_level ? `${a.profile.admin_level} admin` : a.role} ·
                            {a.profile?.county && ` ${a.profile.county}`}
                            {a.profile?.constituency && ` > ${a.profile.constituency}`}
                            {a.profile?.ward && ` > ${a.profile.ward}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize rounded-full text-xs">{a.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-primary" /> Invitation History
              </CardTitle>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(inv.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={inv.status === 'used' ? 'default' : inv.status === 'expired' ? 'destructive' : 'secondary'} className="capitalize rounded-full text-xs">
                        {inv.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {inv.status === 'used' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {inv.status === 'expired' && <XCircle className="h-3 w-3 mr-1" />}
                        {inv.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
