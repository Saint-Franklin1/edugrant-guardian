import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DocumentList from '@/components/user/DocumentList';
import StatusBadge from '@/components/common/StatusBadge';
import {
  DollarSign, Plus, Calendar, Users, Loader2, Eye, CheckCircle, XCircle,
  ArrowLeft, Building2, CreditCard, Banknote, MapPin, Send,
} from 'lucide-react';

interface BursaryProgramManagerProps {
  programs: any[];
  applications: any[];
  onRefresh: () => void;
}

const FUNDING_LEVELS = [
  { value: 'ward', label: 'Ward' },
  { value: 'constituency', label: 'Constituency' },
  { value: 'county', label: 'County' },
  { value: 'well_wisher', label: 'Well-Wisher / NGO' },
];

const BursaryProgramManager = ({ programs, applications, onRefresh }: BursaryProgramManagerProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [disbursing, setDisbursing] = useState(false);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', total_amount: '', per_student_amount: '',
    deadline: '', funding_level: 'county',
  });

  const handleCreate = async () => {
    if (!user || !form.title || !form.total_amount || !form.deadline) {
      toast({ title: 'Fill all required fields', variant: 'destructive' }); return;
    }
    setCreating(true);
    const { error } = await supabase.from('bursary_programs').insert({
      title: form.title,
      description: form.description || null,
      total_amount: Number(form.total_amount),
      per_student_amount: form.per_student_amount ? Number(form.per_student_amount) : null,
      deadline: new Date(form.deadline).toISOString(),
      funding_level: form.funding_level,
      county: profile?.county || null,
      constituency: ['constituency', 'ward'].includes(form.funding_level) ? (profile?.constituency || null) : null,
      ward: form.funding_level === 'ward' ? (profile?.ward || null) : null,
      created_by: user.id,
    });
    setCreating(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Bursary program posted!' });
      setForm({ title: '', description: '', total_amount: '', per_student_amount: '', deadline: '', funding_level: 'county' });
      setShowCreate(false);
      onRefresh();
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    await supabase.from('bursary_applications').update({
      status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id,
    }).eq('id', appId);
    toast({ title: `Application ${status}` });
    onRefresh();
  };

  const viewApplicantDetails = async (app: any) => {
    setSelectedApp(app);
    setLoadingPayment(true);
    const [payRes, disbRes] = await Promise.all([
      supabase.from('school_payment_details').select('*').eq('student_id', app.student_id).maybeSingle(),
      supabase.from('disbursements').select('*').eq('application_id', app.id),
    ]);
    setPaymentDetails(payRes.data);
    setDisbursements(disbRes.data || []);
    setLoadingPayment(false);
  };

  const handleVerifyPayment = async (status: string) => {
    if (!paymentDetails || !user) return;
    await supabase.from('school_payment_details').update({
      status, verified_by: user.id, verified_at: new Date().toISOString(),
    }).eq('id', paymentDetails.id);
    toast({ title: `Payment details ${status}` });
    viewApplicantDetails(selectedApp);
  };

  const handleDisburse = async () => {
    if (!selectedApp || !paymentDetails || !user) return;
    setDisbursing(true);
    const program = programs.find(p => p.id === selectedApp.program_id);
    const amount = program?.per_student_amount || 0;
    const { error } = await supabase.from('disbursements').insert({
      application_id: selectedApp.id,
      student_id: selectedApp.student_id,
      program_id: selectedApp.program_id,
      amount,
      school_payment_id: paymentDetails.id,
      status: 'disbursed',
      disbursed_by: user.id,
      disbursed_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await supabase.from('bursary_applications').update({ status: 'disbursed' }).eq('id', selectedApp.id);
      toast({ title: 'Funds disbursed successfully!' });
      onRefresh();
      viewApplicantDetails(selectedApp);
    }
    setDisbursing(false);
  };

  // Detail view for selected applicant
  if (selectedApp) {
    const program = programs.find(p => p.id === selectedApp.program_id);
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedApp(null)} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Programs
        </Button>

        {/* Applicant Info */}
        <Card className="rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 bg-primary" />
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{selectedApp.student_profiles?.student_name}</CardTitle>
                <CardDescription>{selectedApp.student_profiles?.school_name} · {program?.title}</CardDescription>
              </div>
              <Badge
                variant={selectedApp.status === 'approved' ? 'default' : selectedApp.status === 'rejected' ? 'destructive' : selectedApp.status === 'disbursed' ? 'default' : 'secondary'}
                className="rounded-full text-xs capitalize self-start"
              >
                {selectedApp.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-secondary/60">
                <p className="text-xs text-muted-foreground">Applied</p>
                <p className="font-medium">{new Date(selectedApp.applied_at).toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/60">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-medium">KES {Number(program?.per_student_amount || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/60">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{selectedApp.status}</p>
              </div>
            </div>

            {selectedApp.status === 'pending' && (
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl gap-1.5 flex-1" onClick={() => handleUpdateAppStatus(selectedApp.id, 'approved')}>
                  <CheckCircle className="h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="destructive" className="rounded-xl gap-1.5 flex-1" onClick={() => handleUpdateAppStatus(selectedApp.id, 'rejected')}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Documents */}
        <DocumentList studentId={selectedApp.student_id} />

        {/* School Payment Details */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" /> School Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPayment ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : !paymentDetails ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Student hasn't submitted school payment details yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status</span>
                  <Badge
                    variant={paymentDetails.status === 'verified' ? 'default' : paymentDetails.status === 'rejected' ? 'destructive' : 'secondary'}
                    className="rounded-full text-xs capitalize"
                  >
                    {paymentDetails.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'School', value: paymentDetails.school_name },
                    { label: 'Admission No.', value: paymentDetails.admission_number },
                    { label: 'Bank', value: paymentDetails.bank_name },
                    { label: 'Account Name', value: paymentDetails.account_name },
                    { label: 'Account No.', value: paymentDetails.account_number },
                    { label: 'Branch', value: paymentDetails.branch || '—' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-secondary/60">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                {paymentDetails.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="rounded-xl gap-1.5 flex-1" onClick={() => handleVerifyPayment('verified')}>
                      <CheckCircle className="h-4 w-4" /> Verify Details
                    </Button>
                    <Button size="sm" variant="destructive" className="rounded-xl gap-1.5 flex-1" onClick={() => handleVerifyPayment('rejected')}>
                      <XCircle className="h-4 w-4" /> Reject Details
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disbursement */}
        {selectedApp.status === 'approved' && paymentDetails?.status === 'verified' && disbursements.length === 0 && (
          <Card className="rounded-2xl shadow-sm border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2"><Banknote className="h-4 w-4 text-emerald-600" /> Ready to Disburse</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment details verified. Release KES {Number(program?.per_student_amount || 0).toLocaleString()} to {paymentDetails.school_name}.
                  </p>
                </div>
                <Button className="rounded-xl gap-1.5 shrink-0" onClick={handleDisburse} disabled={disbursing}>
                  {disbursing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Release Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {disbursements.length > 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" /> Disbursement Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {disbursements.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/60">
                  <div>
                    <p className="text-sm font-medium">KES {Number(d.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.disbursed_at || d.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="default" className="rounded-full text-xs capitalize">{d.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-primary" /> Bursary Programs
            </CardTitle>
            <CardDescription>Post bursaries and manage applicant funds.</CardDescription>
          </div>
          <Button size="sm" className="rounded-xl gap-1.5 self-start" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-3.5 w-3.5" /> Post Bursary
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Create Form */}
        {showCreate && (
          <div className="p-4 rounded-xl bg-secondary/60 mb-6 space-y-4">
            <h4 className="font-medium text-sm">Create New Bursary Program</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Title *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. County Education Bursary 2026" className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Description</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Eligibility criteria and requirements..." rows={2} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Funding Level *</Label>
                <Select value={form.funding_level} onValueChange={v => setForm(p => ({ ...p, funding_level: v }))}>
                  <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FUNDING_LEVELS.map(l => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Total Fund (KES) *</Label>
                <Input type="number" value={form.total_amount} onChange={e => setForm(p => ({ ...p, total_amount: e.target.value }))} placeholder="5000000" className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Per Student (KES)</Label>
                <Input type="number" value={form.per_student_amount} onChange={e => setForm(p => ({ ...p, per_student_amount: e.target.value }))} placeholder="50000" className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Deadline *</Label>
                <Input type="datetime-local" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="h-9 rounded-xl" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="rounded-xl" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Post Program'}
              </Button>
              <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Programs List */}
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No bursary programs posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map(p => {
              const isOpen = p.status === 'open' && new Date(p.deadline) > new Date();
              const programApps = applications.filter(a => a.program_id === p.id);
              const level = FUNDING_LEVELS.find(l => l.value === p.funding_level);
              return (
                <div key={p.id} className="p-4 rounded-xl bg-secondary/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm">{p.title}</h4>
                      {p.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {level && <Badge variant="outline" className="rounded-full text-xs"><MapPin className="h-3 w-3 mr-1" />{level.label}</Badge>}
                      <Badge variant={isOpen ? 'default' : 'secondary'} className="rounded-full text-xs">
                        {isOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> KES {Number(p.total_amount).toLocaleString()}</span>
                    {p.per_student_amount && <span>Per student: KES {Number(p.per_student_amount).toLocaleString()}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(p.deadline).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {programApps.length} applicant(s)</span>
                  </div>

                  {/* Applications */}
                  {programApps.length > 0 && (
                    <div className="pt-3 border-t border-border space-y-2">
                      <p className="text-xs font-medium">Applicants:</p>
                      {programApps.map(app => (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-background">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{app.student_profiles?.student_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{app.student_profiles?.school_name}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={app.status === 'approved' || app.status === 'disbursed' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}
                              className="rounded-full text-xs capitalize"
                            >
                              {app.status}
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => viewApplicantDetails(app)}>
                              <Eye className="h-3 w-3" /> View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BursaryProgramManager;
