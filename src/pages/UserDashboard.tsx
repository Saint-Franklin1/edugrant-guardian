import { useState, useEffect, useCallback } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, CheckCircle, FileText, Upload, User, School, Hash,
  GraduationCap, Loader2, Banknote, Calendar, DollarSign, Send,
} from 'lucide-react';
import { useRealtimeTable } from '@/hooks/use-realtime';
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

  // Bursary programs
  const [programs, setPrograms] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

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

    // Fetch bursary programs
    const { data: progData } = await supabase.from('bursary_programs').select('*').order('deadline', { ascending: true });
    setPrograms(progData || []);

    // Fetch my applications
    const { data: appData } = await supabase.from('bursary_applications').select('*, bursary_programs(title, deadline, per_student_amount)').eq('user_id', user.id);
    setMyApplications(appData || []);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleRealtimeUpdate = useCallback(() => { fetchData(); }, [user]);
  useRealtimeTable('documents', handleRealtimeUpdate);
  useRealtimeTable('comments', handleRealtimeUpdate);
  useRealtimeTable('bursary_programs', handleRealtimeUpdate);
  useRealtimeTable('bursary_applications', handleRealtimeUpdate);

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

  const handleApplyBursary = async (programId: string) => {
    if (!student || !user) {
      toast({ title: 'You need a student profile to apply', variant: 'destructive' }); return;
    }
    if (student.status !== 'verified') {
      toast({ title: 'Your application must be verified before applying for bursaries', variant: 'destructive' }); return;
    }
    setApplyingTo(programId);
    const { error } = await supabase.from('bursary_applications').insert({
      program_id: programId,
      student_id: student.id,
      user_id: user.id,
    });
    setApplyingTo(null);
    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        toast({ title: 'Already applied', description: 'You have already applied to this program.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Application submitted!', description: 'Your bursary application has been submitted for review.' });
      fetchData();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout title="Welcome to Elimu Vault">
        <div className="max-w-lg mx-auto">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Create Student Profile</CardTitle>
              <CardDescription>Set up your student profile to begin your bursary application.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createStudentProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm"><User className="h-3.5 w-3.5 text-muted-foreground" />Student Name</Label>
                  <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name as on birth certificate" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm"><Hash className="h-3.5 w-3.5 text-muted-foreground" />Birth Certificate Number</Label>
                  <Input value={birthCert} onChange={e => setBirthCert(e.target.value)} placeholder="e.g. 12345678" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm"><School className="h-3.5 w-3.5 text-muted-foreground" />School Name</Label>
                  <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Current school name" className="h-11 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const openPrograms = programs.filter(p => p.status === 'open' && new Date(p.deadline) > new Date());
  const appliedProgramIds = myApplications.map(a => a.program_id);

  return (
    <DashboardLayout title="Student Dashboard">
      <Tabs defaultValue="application">
        <TabsList className="mb-6 rounded-xl">
          <TabsTrigger value="application" className="rounded-lg">My Application</TabsTrigger>
          <TabsTrigger value="bursaries" className="gap-1.5 rounded-lg">
            <Banknote className="h-3.5 w-3.5" /> Bursaries
            {openPrograms.length > 0 && <Badge className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">{openPrograms.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="application">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card className="rounded-2xl shadow-sm overflow-hidden">
                <div className="h-1 bg-primary" />
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-xl">{student.student_name}</CardTitle>
                    <CardDescription className="mt-1">{student.school_name}</CardDescription>
                  </div>
                  <StatusBadge status={student.status} />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Hash, label: 'Birth Cert', value: student.birth_cert_number || 'Not set' },
                      { icon: FileText, label: 'Education ID', value: student.education_id || 'Pending' },
                      { icon: School, label: 'School', value: student.school_name || 'Not set' },
                      { icon: Upload, label: 'Documents', value: `${uploadedTypes.length} uploaded` },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/60">
                        <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <StatusTracker status={student.status} />

              {student.status === 'draft' && (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Document Checklist</CardTitle>
                      <Badge variant={allRequiredUploaded ? 'default' : 'secondary'} className="text-xs rounded-full">{uploadProgress}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {documentTypes.map(dt => {
                        const uploaded = uploadedTypes.includes(dt.value);
                        return (
                          <div key={dt.value} className={`flex items-center gap-2.5 p-3 rounded-xl text-sm transition-colors ${
                            uploaded ? 'bg-emerald-50 border border-emerald-200' : dt.required ? 'bg-red-50/60 border border-red-100' : 'bg-secondary/60'
                          }`}>
                            {uploaded ? <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" /> : dt.required ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 shrink-0" />}
                            <span className={uploaded ? 'text-emerald-800 font-medium' : 'text-foreground/70'}>{dt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {student.status === 'draft' && <UploadForm studentId={student.id} onUploaded={fetchData} />}
              <DocumentList studentId={student.id} />

              {student.status === 'draft' && (
                <Button onClick={handleSubmit} className="w-full h-12 rounded-xl text-base" disabled={!allRequiredUploaded}>
                  {allRequiredUploaded ? 'Submit Application for Review' : `Upload ${missingRequired.length} more required document(s)`}
                </Button>
              )}

              {comments.length > 0 && (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader><CardTitle className="text-base">Comments from Reviewers</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {comments.map(c => (
                      <div key={c.id} className="p-4 rounded-xl bg-secondary/60">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                          <Badge variant="outline" className="text-xs capitalize rounded-full">{c.role}</Badge>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm">{c.comment_text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {student.status === 'verified' && student.education_id && (
                <QRDisplay student={student} ward={profile?.ward || ''} constituency={profile?.constituency || ''} />
              )}
            </div>
          </div>
        </TabsContent>

        {/* BURSARIES TAB */}
        <TabsContent value="bursaries">
          <div className="space-y-6">
            {/* My Applications */}
            {myApplications.length > 0 && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Send className="h-4 w-4 text-primary" /> My Bursary Applications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {myApplications.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60">
                      <div>
                        <p className="font-medium text-sm">{app.bursary_programs?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied {new Date(app.applied_at).toLocaleDateString()}
                          {app.bursary_programs?.per_student_amount && ` · KES ${Number(app.bursary_programs.per_student_amount).toLocaleString()}`}
                        </p>
                      </div>
                      <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize rounded-full text-xs">
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Available Programs */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-4 w-4 text-primary" /> Available Bursary Programs
                </CardTitle>
                <CardDescription>Apply for bursaries posted by administrators. You must be verified to apply.</CardDescription>
              </CardHeader>
              <CardContent>
                {openPrograms.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No open bursary programs at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openPrograms.map(p => {
                      const alreadyApplied = appliedProgramIds.includes(p.id);
                      const canApply = student.status === 'verified' && !alreadyApplied;
                      return (
                        <div key={p.id} className="p-4 rounded-xl bg-secondary/60 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{p.title}</h4>
                              {p.description && <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>}
                            </div>
                            <Badge className="rounded-full text-xs">Open</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Total: KES {Number(p.total_amount).toLocaleString()}</span>
                            {p.per_student_amount && <span>Per student: KES {Number(p.per_student_amount).toLocaleString()}</span>}
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                            {p.county && <span>Region: {p.county}{p.constituency ? ` > ${p.constituency}` : ''}</span>}
                          </div>
                          <div>
                            {alreadyApplied ? (
                              <Badge variant="outline" className="rounded-full text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Applied</Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="rounded-xl gap-1.5"
                                onClick={() => handleApplyBursary(p.id)}
                                disabled={!canApply || applyingTo === p.id}
                              >
                                {applyingTo === p.id ? 'Applying...' : student.status !== 'verified' ? 'Verification required' : 'Apply Now'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default UserDashboard;
