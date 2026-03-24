import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/common/StatusBadge';
import DocumentList from '@/components/user/DocumentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, XCircle, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const bursarySteps = ['verified', 'approved_for_funding', 'allocated', 'disbursed', 'completed'];

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [bursaryRecords, setBursaryRecords] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // Fetch student profiles (RLS handles scoping to constituency)
    const { data: studData } = await supabase.from('student_profiles').select('*');
    const studentList = studData || [];

    // Fetch profiles for these students to get geographic info
    if (studentList.length > 0) {
      const userIds = [...new Set(studentList.map(s => s.user_id))];
      const { data: profilesData } = await supabase.from('profiles').select('user_id, name, ward, constituency, county').in('user_id', userIds);
      const profileMap = Object.fromEntries((profilesData || []).map(p => [p.user_id, p]));
      studentList.forEach((s: any) => { s.studentProfile = profileMap[s.user_id]; });
    }

    const [burRes, fraudRes] = await Promise.all([
      supabase.from('bursary_records').select('*, student_profiles(student_name, school_name)'),
      supabase.from('fraud_flags').select('*, student_profiles(student_name)'),
    ]);

    setStudents(studentList);
    setBursaryRecords(burRes.data || []);
    setFraudFlags(fraudRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

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

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">Loading dashboard data...</p>
          </div>
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
      <DashboardLayout title="Final Review">
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4">← Back</Button>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{selected.student_name}</CardTitle>
                <StatusBadge status={selected.status} />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">School:</span> {selected.school_name}</div>
                  <div><span className="text-muted-foreground">Birth Cert:</span> {selected.birth_cert_number}</div>
                  <div><span className="text-muted-foreground">Ward:</span> {selected.studentProfile?.ward}</div>
                  <div><span className="text-muted-foreground">Constituency:</span> {selected.studentProfile?.constituency}</div>
                </div>
              </CardContent>
            </Card>
            <DocumentList studentId={selected.id} />
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Add Comment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
                <Button onClick={handleComment} variant="secondary" className="w-full" disabled={!comment.trim()}>Submit Comment</Button>
              </CardContent>
            </Card>
            {selected.status === 'under_review' && (
              <div className="flex gap-2">
                <Button onClick={() => handleFinalApproval('approved')} className="flex-1"><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
                <Button onClick={() => handleFinalApproval('rejected')} variant="destructive" className="flex-1"><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        {[
          { label: 'Total Applications', value: stats.total, icon: Users },
          { label: 'Pending Review', value: stats.pending, icon: Shield },
          { label: 'Verified', value: stats.verified, icon: CheckCircle },
          { label: 'Rejected', value: stats.rejected, icon: XCircle },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><s.icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-heading font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="bursary">Bursary Tracker</TabsTrigger>
          <TabsTrigger value="flags">Fraud Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {students.length === 0 ? (
                <p className="text-muted-foreground">No applications in your constituency yet.</p>
              ) : (
                <div className="space-y-2">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => setSelected(s)}>
                      <div>
                        <p className="font-medium">{s.student_name}</p>
                        <p className="text-sm text-muted-foreground">{s.school_name} • {s.studentProfile?.ward}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bursary" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Bursary Lifecycle</CardTitle></CardHeader>
            <CardContent>
              {bursaryRecords.length === 0 ? (
                <p className="text-muted-foreground">No bursary records yet.</p>
              ) : (
                <div className="space-y-4">
                  {bursaryRecords.map(b => {
                    const currentIdx = bursarySteps.indexOf(b.status);
                    const nextStatus = bursarySteps[currentIdx + 1];
                    return (
                      <div key={b.id} className="p-4 rounded-lg bg-muted space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{b.student_profiles?.student_name}</p>
                            <p className="text-sm text-muted-foreground">{b.student_profiles?.school_name}</p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                        {b.allocated_amount && <p className="text-sm">Amount: KES {Number(b.allocated_amount).toLocaleString()}</p>}
                        {nextStatus && (
                          <div className="flex gap-2 items-end">
                            {nextStatus === 'allocated' && (
                              <div className="flex-1">
                                <Label className="text-xs">Amount (KES)</Label>
                                <Input type="number" placeholder="Amount" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} className="h-8" />
                              </div>
                            )}
                            <Button size="sm" onClick={() => updateBursaryStatus(b.id, nextStatus, nextStatus === 'allocated' ? Number(allocAmount) : undefined)}>
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

        <TabsContent value="flags" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Fraud Flags</CardTitle></CardHeader>
            <CardContent>
              {fraudFlags.length === 0 ? (
                <p className="text-muted-foreground">No fraud flags detected.</p>
              ) : (
                <div className="space-y-2">
                  {fraudFlags.map(f => (
                    <div key={f.id} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="font-medium text-sm">{f.flag_type}</p>
                      <p className="text-xs text-muted-foreground">{f.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">Student: {f.student_profiles?.student_name}</p>
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
