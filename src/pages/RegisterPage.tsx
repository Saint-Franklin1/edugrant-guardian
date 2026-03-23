import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { counties } from '@/lib/kenya-data';
import { Check, X } from 'lucide-react';
import logo from '@/assets/logo.png';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(p) },
];

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    county: '', constituency: '', ward: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const passwordValid = useMemo(() => PASSWORD_RULES.every(r => r.test(form.password)), [form.password]);
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      toast({ title: 'Weak password', description: 'Please meet all password requirements.', variant: 'destructive' });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: 'Passwords do not match', description: 'Please confirm your password.', variant: 'destructive' });
      return;
    }
    if (!form.county || !form.constituency || !form.ward) {
      toast({ title: 'Missing fields', description: 'Please fill in all location fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
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
      toast({ title: 'Account created!', description: 'Please check your email to verify your account before signing in.' });
      navigate('/login');
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    setGoogleLoading(false);
    if (error) {
      toast({ title: 'Google signup failed', description: String(error), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="Elimu Vault Logo" className="h-20 w-auto mx-auto mb-3" />
          <h1 className="font-heading text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Register as a student / parent applicant</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name (as on ID / Birth Certificate)</Label>
              <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Create a strong password" required />
              {form.password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {PASSWORD_RULES.map(r => (
                    <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(form.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {r.test(form.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Re-enter your password" required />
              {form.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
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
            <Button type="submit" className="w-full" disabled={loading || !passwordValid || !passwordsMatch}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={googleLoading}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {googleLoading ? 'Connecting...' : 'Sign up with Google'}
          </Button>

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
