import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const RequestAdminAccessPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', requested_level: '', county: '', constituency: '', ward: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.requested_level) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('admin_requests').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      requested_level: form.requested_level,
      county: form.county || null,
      constituency: form.constituency || null,
      ward: form.ward || null,
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Request Submitted</h1>
          <p className="text-muted-foreground mb-6">
            Your request to become an administrator has been submitted for review. The Super Admin will contact you if approved.
          </p>
          <Link to="/login">
            <Button variant="outline" className="rounded-xl gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="h-14 w-14 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Request Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">Submit your details for review by the Super Admin</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" required className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.co.ke" required className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+254..." className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Requested Level *</Label>
                <Select value={form.requested_level} onValueChange={v => update('requested_level', v)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="county">County Admin</SelectItem>
                    <SelectItem value="constituency">Constituency Admin</SelectItem>
                    <SelectItem value="ward">Ward Admin / Chief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Input value={form.county} onChange={e => update('county', e.target.value)} placeholder="e.g. Nairobi" className="h-11 rounded-xl" />
              </div>
              {(form.requested_level === 'constituency' || form.requested_level === 'ward') && (
                <div className="space-y-2">
                  <Label>Constituency</Label>
                  <Input value={form.constituency} onChange={e => update('constituency', e.target.value)} placeholder="e.g. Westlands" className="h-11 rounded-xl" />
                </div>
              )}
              {form.requested_level === 'ward' && (
                <div className="space-y-2">
                  <Label>Ward</Label>
                  <Input value={form.ward} onChange={e => update('ward', e.target.value)} placeholder="e.g. Parklands" className="h-11 rounded-xl" />
                </div>
              )}

              <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Request
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestAdminAccessPage;
