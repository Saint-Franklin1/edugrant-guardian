import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getScopeLabel } from '@/lib/profile-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/common/StatusBadge';
import DocumentList from '@/components/user/DocumentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, CheckCircle, XCircle, Users, TrendingUp, AlertTriangle,
  MapPin, ArrowLeft, MessageSquare, Banknote, Loader2, Search,
} from 'lucide-react';
import { useRealtimeTable } from '@/hooks/use-realtime';
import BursaryProgramManager from '@/components/admin/BursaryProgramManager';

const bursarySteps = ['verified', 'approved_for_funding', 'allocated', 'disbursed', 'completed'];

const AdminDashboard = () => {
  const { user, profile, role, session } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [bursaryRecords, setBursaryRecords] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [loading, setLoading] = useState(true);

  // Bursary Programs
  const [programs, setPrograms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // Student Lookup
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [annCategory, setAnnCategory] = useState('');
  const [annEligibility, setAnnEligibility] = useState('');
  const [annDeadline, setAnnDeadline] = useState('');
  const [creatingAnn, setCreatingAnn] = useState(false);

  const scopeLabel = getScopeLabel(profile, role);

  const fetchData = async () => {
    setLoading(true);
    const { data: studData } = await supabase.from('student_profiles').select('*');
    const studentList = studData || [];

    if (studentList.length > 0) {
      const userIds = [...new Set(studentList.map(s => s.user_id))];
      const { data: profilesData } = await supabase.from('profiles').select('user_id, name, ward, constituency, county').in('user_id', userIds);
      const profileMap = Object.fromEntries((profilesData || []).map(p => [p.user_id, p]));
      studentList.forEach((s: any) => { s.studentProfile = profileMap[s.user_id]; });
    }

    const [burRes, fraudRes, progRes, appRes, annRes] = await Promise.all([
      supabase.from('bursary_records').select('*, student_profiles(student_name, school_name)'),
      supabase.from('fraud_flags').select('*, student_profiles(student_name)'),
      supabase.from('bursary_programs').select('*').order('created_at', { ascending: false }),
      supabase.from('bursary_applications').select('*, student_profiles(student_name, school_name), bursary_programs(title)'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    ]);

    setStudents(studentList);
    setBursaryRecords(burRes.data || []);
    setFraudFlags(fraudRes.data || []);
    setPrograms(progRes.data || []);
    setApplications(appRes.data || []);
    setAnnouncements((annRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRealtimeUpdate = useCallback(() => { fetchData(); }, []);
  useRealtimeTable('documents', handleRealtimeUpdate);
  useRealtimeTable('comments', handleRealtimeUpdate);
  useRealtimeTable('bursary_programs', handleRealtimeUpdate);
  useRealtimeTable('bursary_applications', handleRealtimeUpdate);
  useRealtimeTable('disbursements', handleRealtimeUpdate);
  useRealtimeTable('school_payment_details', handleRealtimeUpdate);

  const handleFinalApproval = async (decision: 'approved' | 'rejected') => {
    if (!selected || !user) return;
    const newStatus = decision === 'approved' ? 'verified' : 'rejected';
    const educationId = decision === 'approved' ? `EV-${Date.now().toString(36).toUpperCase()}-${selected.id.slice(0, 4).toUpperCase()}` : null;

    await supabase.from('verification_records').insert({
      student_id: selected.id, verifier_id: user.id, role: 'admin' as any, decision: decision as any,
    });
    await supabase.from('student_profiles').update({ status: newStatus as any, education_id: educationId }).eq('id', selected.id);

    if (decision === 'approved') {
      await supabase.from('bursary_records').insert({ student_id: selected.id, status: 'verified' as any });
    }

    await supabase.from('audit_logs').insert({ actor_id: user.id, action: `admin_${decision}`, target_id: selected.id });
    toast({ title: `Application ${decision}` });
    setSelected(null);
    fetchData();
  };

  const handleComment = async () => {
    if (!selected || !user || !comment.trim()) return;
    await supabase.from('comments').insert({ student_id: selected.id, author_id: user.id, role: 'admin' as any, comment_text: comment });
    toast({ title: 'Comment added' });
    setComment('');
  };

  const updateBursaryStatus = async (recordId: string, newStatus: string, amount?: number) => {
    const updateData: any = { status: newStatus };
    if (amount) updateData.allocated_amount = amount;
    await supabase.from('bursary_records').update(updateData).eq('id', recordId);
    toast({ title: 'Bursary status updated' });
    fetchData();
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    await supabase.from('bursary_applications').update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id }).eq('id', appId);
    toast({ title: `Application ${status}` });
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

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: students.length,
    pending: students.filter(s => s.status === 'under_review').length,
    verified: students.filter(s => s.status === 'verified').length,
    rejected: students.filter(s => s.status === 'rejected').length,
  };

  if (selected) {
    return (
      <DashboardLayout title="Application Review">
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-6 gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Queue
        </Button>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 bg-primary" />
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-xl">{selected.student_name}</CardTitle>
                  <CardDescription className="mt-1">{selected.school_name}</CardDescription>
                </div>
                <StatusBadge status={selected.status} />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Birth Cert', value: selected.birth_cert_number },
                    { label: 'Ward', value: selected.studentProfile?.ward },
                    { label: 'Constituency', value: selected.studentProfile?.constituency },
                    { label: 'County', value: selected.studentProfile?.county },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-secondary/60">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium mt-0.5">{item.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <DocumentList studentId={selected.id} />
          </div>
          <div className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Add Comment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Type your review comment..." rows={3} className="rounded-xl" />
                <Button onClick={handleComment} variant="secondary" className="w-full rounded-xl" disabled={!comment.trim()}>
                  Submit Comment
                </Button>
              </CardContent>
            </Card>
            {selected.status === 'under_review' && (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleFinalApproval('approved')} className="gap-1.5 rounded-xl">
                  <CheckCircle className="h-4 w-4" /> Approve
                </Button>
                <Button onClick={() => handleFinalApproval('rejected')} variant="destructive" className="gap-1.5 rounded-xl">
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      {scopeLabel && (
        <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-primary">Viewing: {scopeLabel}</span>
          <Badge variant="outline" className="ml-auto text-xs capitalize rounded-full">{profile?.admin_level} Admin</Badge>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total Applications', value: stats.total, icon: Users },
          { label: 'Pending Review', value: stats.pending, icon: Shield },
          { label: 'Verified', value: stats.verified, icon: CheckCircle },
          { label: 'Rejected', value: stats.rejected, icon: XCircle },
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

      <Tabs defaultValue="applications">
        <TabsList className="mb-6 rounded-xl flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="applications" className="rounded-lg text-xs sm:text-sm">Applications</TabsTrigger>
          <TabsTrigger value="bursary" className="gap-1 sm:gap-1.5 rounded-lg text-xs sm:text-sm"><Banknote className="h-3.5 w-3.5" /> Bursary</TabsTrigger>
          <TabsTrigger value="programs" className="gap-1 sm:gap-1.5 rounded-lg text-xs sm:text-sm"><Banknote className="h-3.5 w-3.5" /> Programs</TabsTrigger>
          <TabsTrigger value="lookup" className="gap-1.5 rounded-lg"><Search className="h-3.5 w-3.5" /> Lookup</TabsTrigger>
          <TabsTrigger value="flags" className="gap-1.5 rounded-lg">
            <AlertTriangle className="h-3.5 w-3.5" /> Flags
            {fraudFlags.length > 0 && <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">{fraudFlags.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              {students.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer group" onClick={() => setSelected(s)}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {s.student_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{s.student_name}</p>
                          <p className="text-xs text-muted-foreground">{s.school_name} {s.studentProfile?.ward ? `· ${s.studentProfile.ward}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={s.status} />
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bursary">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" /> Bursary Lifecycle</CardTitle>
            </CardHeader>
            <CardContent>
              {bursaryRecords.length === 0 ? (
                <div className="text-center py-16">
                  <Banknote className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No bursary records yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bursaryRecords.map(b => {
                    const currentIdx = bursarySteps.indexOf(b.status);
                    const nextStatus = bursarySteps[currentIdx + 1];
                    return (
                      <div key={b.id} className="p-4 rounded-xl bg-secondary/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{b.student_profiles?.student_name}</p>
                            <p className="text-xs text-muted-foreground">{b.student_profiles?.school_name}</p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                        {b.allocated_amount && <p className="text-sm font-medium">Amount: KES {Number(b.allocated_amount).toLocaleString()}</p>}
                        {nextStatus && (
                          <div className="flex gap-2 items-end pt-2 border-t border-border">
                            {nextStatus === 'allocated' && (
                              <div className="flex-1">
                                <Label className="text-xs">Amount (KES)</Label>
                                <Input type="number" placeholder="Enter amount" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} className="h-9 rounded-xl" />
                              </div>
                            )}
                            <Button size="sm" className="rounded-xl" onClick={() => updateBursaryStatus(b.id, nextStatus, nextStatus === 'allocated' ? Number(allocAmount) : undefined)}>
                              Move to {nextStatus.replace(/_/g, ' ')}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BURSARY PROGRAMS TAB */}
        <TabsContent value="programs">
          <BursaryProgramManager programs={programs} applications={applications} onRefresh={fetchData} />
        </TabsContent>

        {/* STUDENT LOOKUP TAB */}
        <TabsContent value="lookup">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-primary" /> Student Lookup
              </CardTitle>
              <CardDescription>Enter an Education ID or scan QR code to view student documents and info.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 max-w-md mb-6">
                <Input value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="Enter Education ID (e.g. EV-M3X7K...)" className="h-11 rounded-xl" onKeyDown={e => e.key === 'Enter' && handleLookup()} />
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Fraud Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fraudFlags.length === 0 ? (
                <div className="text-center py-16">
                  <Shield className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No fraud flags — all clear.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fraudFlags.map(f => (
                    <div key={f.id} className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-destructive">{f.flag_type}</p>
                          <p className="text-xs text-destructive/70 mt-0.5">{f.details}</p>
                          <p className="text-xs text-destructive/60 mt-2">Student: {f.student_profiles?.student_name}</p>
                        </div>
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

export default AdminDashboard;
