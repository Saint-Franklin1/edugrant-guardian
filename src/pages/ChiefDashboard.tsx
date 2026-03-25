import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getScopeLabel } from '@/lib/profile-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/common/StatusBadge';
import DocumentList from '@/components/user/DocumentList';
import { Users, Eye, MessageSquare, MapPin, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

const ChiefDashboard = () => {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const scopeLabel = getScopeLabel(profile, role);

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from('student_profiles').select('*').in('status', ['submitted', 'under_review']);
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selected || !user) return;
    const newStatus = decision === 'approved' ? 'under_review' : 'rejected';

    const { error: verErr } = await supabase.from('verification_records').insert({
      student_id: selected.id, verifier_id: user.id, role: 'chief' as any, decision: decision as any,
    });
    if (verErr) { toast({ title: 'Error', description: verErr.message, variant: 'destructive' }); return; }

    await supabase.from('student_profiles').update({ status: newStatus as any }).eq('id', selected.id);
    await supabase.from('audit_logs').insert({ actor_id: user.id, action: `chief_${decision}`, target_id: selected.id });

    toast({ title: `Application ${decision}` });
    setSelected(null);
    fetchStudents();
  };

  const handleComment = async () => {
    if (!selected || !user || !comment.trim()) return;
    const { error } = await supabase.from('comments').insert({
      student_id: selected.id, author_id: user.id, role: 'chief' as any, comment_text: comment,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Comment added' });
    setComment('');
  };

  if (loading) {
    return (
      <DashboardLayout title="Chief Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <p className="text-muted-foreground text-sm">Loading verification queue...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: students.length,
    submitted: students.filter(s => s.status === 'submitted').length,
    underReview: students.filter(s => s.status === 'under_review').length,
  };

  if (selected) {
    return (
      <DashboardLayout title="Review Application">
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Queue
        </Button>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1.5 bg-accent" />
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="font-heading text-xl">{selected.student_name}</CardTitle>
                  <CardDescription>{selected.school_name}</CardDescription>
                </div>
                <StatusBadge status={selected.status} />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Birth Cert', value: selected.birth_cert_number },
                    { label: 'School', value: selected.school_name },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <DocumentList studentId={selected.id} />
          </div>
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Add Comment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Type your review comment..." rows={3} />
                <Button onClick={handleComment} variant="secondary" className="w-full" disabled={!comment.trim()}>
                  Submit Comment
                </Button>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleDecision('approved')} className="gap-1.5">
                <CheckCircle className="h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => handleDecision('rejected')} variant="destructive" className="gap-1.5">
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Chief Dashboard">
      {/* Scope Label */}
      {scopeLabel && (
        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-accent/5 border border-accent/10">
          <MapPin className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm font-medium text-accent">Viewing: {scopeLabel}</span>
          <Badge variant="outline" className="ml-auto text-xs">Chief</Badge>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: 'Total in Queue', value: stats.total, icon: Users, color: 'bg-accent/10 text-accent' },
          { label: 'New Submissions', value: stats.submitted, icon: Eye, color: 'bg-blue-50 text-blue-600' },
          { label: 'Under Review', value: stats.underReview, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queue */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Users className="h-5 w-5 text-accent" /> Verification Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="font-medium text-muted-foreground">No pending applications</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Applications from your ward will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                  onClick={() => setSelected(s)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-heading font-bold text-sm">
                      {s.student_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{s.student_name}</p>
                      <p className="text-sm text-muted-foreground">{s.school_name}</p>
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
    </DashboardLayout>
  );
};

export default ChiefDashboard;
