import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, CreditCard, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface SchoolPaymentFormProps {
  studentId: string;
}

const SchoolPaymentForm = ({ studentId }: SchoolPaymentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    branch: '',
    school_name: '',
    admission_number: '',
  });

  const fetchDetails = async () => {
    const { data } = await supabase
      .from('school_payment_details')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    setDetails(data);
    if (data) {
      setForm({
        bank_name: data.bank_name,
        account_name: data.account_name,
        account_number: data.account_number,
        branch: data.branch || '',
        school_name: data.school_name,
        admission_number: data.admission_number,
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchDetails(); }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    if (details) {
      // Update existing (only if pending or rejected)
      const { error } = await supabase
        .from('school_payment_details')
        .update({ ...form, status: 'pending', verified_by: null, verified_at: null })
        .eq('id', details.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Payment details updated!' });
        fetchDetails();
      }
    } else {
      const { error } = await supabase
        .from('school_payment_details')
        .insert({ ...form, student_id: studentId, user_id: user.id });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'School payment details submitted!' });
        fetchDetails();
      }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const statusIcon = details?.status === 'verified' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> :
    details?.status === 'rejected' ? <XCircle className="h-4 w-4 text-destructive" /> :
    details?.status === 'pending' ? <Clock className="h-4 w-4 text-warning" /> : null;

  const canEdit = !details || details.status === 'pending' || details.status === 'rejected';

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" /> School Payment Details
          </CardTitle>
          {details && (
            <Badge
              variant={details.status === 'verified' ? 'default' : details.status === 'rejected' ? 'destructive' : 'secondary'}
              className="rounded-full text-xs capitalize flex items-center gap-1"
            >
              {statusIcon} {details.status}
            </Badge>
          )}
        </div>
        <CardDescription>
          Submit your school's official bank details for bursary fund disbursement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {details?.status === 'verified' ? (
          <div className="space-y-3">
            {[
              { label: 'School', value: details.school_name },
              { label: 'Admission No.', value: details.admission_number },
              { label: 'Bank', value: details.bank_name },
              { label: 'Account Name', value: details.account_name },
              { label: 'Account No.', value: details.account_number },
              { label: 'Branch', value: details.branch || '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/60">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {details?.status === 'rejected' && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                Your payment details were rejected. Please correct and resubmit.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">School Name *</Label>
                <Input value={form.school_name} onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))} placeholder="e.g. Nairobi Boys High" required className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Admission Number *</Label>
                <Input value={form.admission_number} onChange={e => setForm(f => ({ ...f, admission_number: e.target.value }))} placeholder="e.g. ADM-2024-001" required className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bank Name *</Label>
                <Input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="e.g. Kenya Commercial Bank" required className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Account Name *</Label>
                <Input value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} placeholder="School account name" required className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Account Number *</Label>
                <Input value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} placeholder="e.g. 1234567890" required className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Branch</Label>
                <Input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} placeholder="e.g. Nairobi CBD" className="h-9 rounded-xl" />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl gap-2" disabled={saving || !canEdit}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><CreditCard className="h-4 w-4" /> {details ? 'Update Details' : 'Submit Payment Details'}</>}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolPaymentForm;
