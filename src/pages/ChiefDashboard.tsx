import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/common/StatusBadge';
import DocumentList from '@/components/user/DocumentList';
import { Users, Eye, MessageSquare } from 'lucide-react';

const ChiefDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    const { data } = await supabase.from('student_profiles').select('*, profiles:user_id(name, ward, constituency, county)').in('status', ['submitted', 'under_review']);
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selected || !user) return;
    const newStatus = decision === 'approved' ? 'under_review' : 'rejected';
    
    const { error: verErr } = await supabase.from('verification_records').insert({
      student_id: selected.id,
      verifier_id: user.id,
      role: 'chief' as any,
      decision: decision as any,
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
      student_id: selected.id,
      author_id: user.id,
      role: 'chief' as any,
      comment_text: comment,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Comment added' });
    setComment('');
  };

  if (selected) {
    return (
      <DashboardLayout title="Review Application">
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4">← Back to Queue</Button>
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
                </div>
              </CardContent>
            </Card>
            <DocumentList studentId={selected.id} />
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Add Comment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
                <Button onClick={handleComment} variant="secondary" className="w-full" disabled={!comment.trim()}>Submit Comment</Button>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button onClick={() => handleDecision('approved')} className="flex-1">Approve</Button>
              <Button onClick={() => handleDecision('rejected')} variant="destructive" className="flex-1">Reject</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Chief Dashboard">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Verification Queue</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Loading...</p> : students.length === 0 ? (
            <p className="text-muted-foreground">No pending applications.</p>
          ) : (
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => setSelected(s)}>
                  <div>
                    <p className="font-medium">{s.student_name}</p>
                    <p className="text-sm text-muted-foreground">{s.school_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={s.status} />
                    <Eye className="h-4 w-4 text-muted-foreground" />
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
