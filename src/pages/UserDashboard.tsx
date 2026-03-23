import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UploadForm from '@/components/user/UploadForm';
import DocumentList from '@/components/user/DocumentList';
import StatusTracker from '@/components/user/StatusTracker';
import QRDisplay from '@/components/user/QRDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/common/StatusBadge';
import type { Database } from '@/integrations/supabase/types';

type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [creating, setCreating] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [birthCert, setBirthCert] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single();
    setStudent(data);
    if (data) {
      const { data: cmts } = await supabase.from('comments').select('*').eq('student_id', data.id).order('created_at', { ascending: true });
      setComments(cmts || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const createStudentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const { error } = await supabase.from('student_profiles').insert({
      user_id: user.id,
      student_name: studentName,
      birth_cert_number: birthCert,
      school_name: schoolName,
    });
    setCreating(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile created!' });
      fetchData();
    }
  };

  const handleSubmit = async () => {
    if (!student) return;
    const { error } = await supabase.from('student_profiles').update({
      status: 'submitted' as any,
      submitted_at: new Date().toISOString(),
    }).eq('id', student.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Application submitted!' });
      fetchData();
    }
  };

  if (loading) return <DashboardLayout title="Dashboard"><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  if (!student) {
    return (
      <DashboardLayout title="Create Student Profile">
        <Card className="max-w-lg">
          <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createStudentProfile} className="space-y-4">
              <div><Label>Student Name</Label><Input value={studentName} onChange={e => setStudentName(e.target.value)} required /></div>
              <div><Label>Birth Certificate Number</Label><Input value={birthCert} onChange={e => setBirthCert(e.target.value)} /></div>
              <div><Label>School Name</Label><Input value={schoolName} onChange={e => setSchoolName(e.target.value)} /></div>
              <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Profile'}</Button>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Application</CardTitle>
              <StatusBadge status={student.status} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {student.student_name}</div>
                <div><span className="text-muted-foreground">School:</span> {student.school_name}</div>
                <div><span className="text-muted-foreground">Birth Cert:</span> {student.birth_cert_number}</div>
                <div><span className="text-muted-foreground">Education ID:</span> {student.education_id || 'Pending'}</div>
              </div>
            </CardContent>
          </Card>

          <StatusTracker status={student.status} />

          {student.status === 'draft' && (
            <UploadForm studentId={student.id} onUploaded={fetchData} />
          )}

          <DocumentList studentId={student.id} />

          {student.status === 'draft' && (
            <Button onClick={handleSubmit} className="w-full">Submit Application for Review</Button>
          )}

          {comments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Comments from Reviewers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-muted">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="capitalize font-medium">{c.role}</span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{c.comment_text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        <div>
          {student.status === 'verified' && student.education_id && (
            <QRDisplay student={student} ward={profile?.ward || ''} constituency={profile?.constituency || ''} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
