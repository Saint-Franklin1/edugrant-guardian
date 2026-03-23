import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { counties } from '@/lib/kenya-data';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    county: '', constituency: '', ward: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.county || !form.constituency || !form.ward) {
      toast({ title: 'Missing fields', description: 'Please fill in all location fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          county: form.county,
          constituency: form.constituency,
          ward: form.ward,
          role: 'user',
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!', description: 'You can now sign in.' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-primary items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Register as a student applicant</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters" minLength={6} required />
            </div>
            <div>
              <Label>County</Label>
              <Select value={form.county} onValueChange={v => update('county', v)}>
                <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>
                  {counties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="constituency">Constituency</Label>
              <Input id="constituency" value={form.constituency} onChange={e => update('constituency', e.target.value)} placeholder="Your constituency" required />
            </div>
            <div>
              <Label htmlFor="ward">Ward</Label>
              <Input id="ward" value={form.ward} onChange={e => update('ward', e.target.value)} placeholder="Your ward" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
