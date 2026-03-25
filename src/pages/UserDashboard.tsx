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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/common/StatusBadge';
import { requiredDocumentTypes, documentTypes } from '@/lib/kenya-data';
import { AlertTriangle, CheckCircle, FileText, Upload, User, School, Hash, GraduationCap } from 'lucide-react';
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
  const [uploadedTypes, setUploadedTypes] = useState<string[]>([]);

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single();
    setStudent(data);
    if (data) {
      const [cmtRes, docRes] = await Promise.all([
        supabase.from('comments').select('*').eq('student_id', data.id).order('created_at', { ascending: true }),
        supabase.from('documents').select('type').eq('student_id', data.id).eq('is_active', true),
      ]);
      setComments(cmtRes.data || []);
      setUploadedTypes((docRes.data || []).map(d => d.type));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const missingRequired = requiredDocumentTypes.filter(t => !uploadedTypes.includes(t));
  const allRequiredUploaded = missingRequired.length === 0;
  const uploadProgress = Math.round(((requiredDocumentTypes.length - missingRequired.length) / requiredDocumentTypes.length) * 100);

  const createStudentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const { error } = await supabase.from('student_profiles').insert({
      user_id: user.id, student_name: studentName, birth_cert_number: birthCert, school_name: schoolName,
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
    if (!allRequiredUploaded) {
      toast({
        title: 'Missing documents',
        description: `Please upload all required documents. Missing: ${missingRequired.map(t => documentTypes.find(d => d.value === t)?.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    const { error } = await supabase.from('student_profiles').update({
      status: 'submitted' as any, submitted_at: new Date().toISOString(),
    }).eq('id', student.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Application submitted!' });
      fetchData();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout title="Welcome to Elimu Vault">
        <div className="max-w-xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-heading text-xl">Create Student Profile</CardTitle>
              <CardDescription>Let's set up your student profile to get started with your bursary application.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createStudentProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Student Name</Label>
                  <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name as on birth certificate" required />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Hash className="h-4 w-4 text-muted-foreground" />Birth Certificate Number</Label>
                  <Input value={birthCert} onChange={e => setBirthCert(e.target.value)} placeholder="e.g. 12345678" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><School className="h-4 w-4 text-muted-foreground" />School Name</Label>
                  <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Current school name" />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Status Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-primary" />
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="font-heading text-xl">{student.student_name}</CardTitle>
                <CardDescription>{student.school_name}</CardDescription>
              </div>
              <StatusBadge status={student.status} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Hash, label: 'Birth Cert', value: student.birth_cert_number || 'Not set' },
                  { icon: FileText, label: 'Education ID', value: student.education_id || 'Pending verification' },
                  { icon: School, label: 'School', value: student.school_name || 'Not set' },
                  { icon: Upload, label: 'Documents', value: `${uploadedTypes.length} uploaded` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <StatusTracker status={student.status} />

          {/* Upload Progress */}
          {student.status === 'draft' && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-heading">Document Upload Progress</CardTitle>
                  <Badge variant={allRequiredUploaded ? 'default' : 'secondary'} className="text-xs">
                    {uploadProgress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                {/* Checklist */}
                <div className="grid sm:grid-cols-2 gap-2">
                  {documentTypes.map(dt => {
                    const uploaded = uploadedTypes.includes(dt.value);
                    return (
                      <div key={dt.value} className={`flex items-center gap-2.5 p-2.5 rounded-lg text-sm transition-colors ${
                        uploaded ? 'bg-emerald-50 border border-emerald-200' : dt.required ? 'bg-red-50/50 border border-red-100' : 'bg-muted/50'
                      }`}>
                        {uploaded ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : dt.required ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 shrink-0" />
                        )}
                        <span className={uploaded ? 'text-emerald-800 font-medium' : 'text-foreground/70'}>
                          {dt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Form */}
          {student.status === 'draft' && (
            <UploadForm studentId={student.id} onUploaded={fetchData} />
          )}

          {/* Documents */}
          <DocumentList studentId={student.id} />

          {/* Submit Button */}
          {student.status === 'draft' && (
            <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!allRequiredUploaded}>
              {allRequiredUploaded ? 'Submit Application for Review' : `Upload ${missingRequired.length} more required document(s)`}
            </Button>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-base font-heading">Comments from Reviewers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-muted/50 border">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-xs capitalize">{c.role}</Badge>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{c.comment_text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {student.status === 'verified' && student.education_id && (
            <QRDisplay student={student} ward={profile?.ward || ''} constituency={profile?.constituency || ''} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
