import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || !code) {
      setErrorMsg('All fields are required.');
      return;
    }

    // Client-side password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMsg('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
      return;
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setErrorMsg('Access code must be a 6-digit number.');
      return;
    }

    setLoading(true);

    // Force sign out any existing session
    await supabase.auth.signOut();

    const { data, error } = await supabase.functions.invoke('register-admin', {
      body: { email, password, code },
    });

    setLoading(false);

    if (error || data?.error) {
      const msg = data?.error || error?.message || 'Registration failed';
      setErrorMsg(msg);
      return;
    }

    toast({
      title: '✅ Account Created!',
      description: 'Your admin account is ready. Please log in.',
    });

    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="h-14 w-14 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Staff Registration</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter the access code provided by your Super Admin
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.co.ke"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, mixed case, number & symbol"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">6-Digit Access Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="text-center text-xl tracking-[0.5em] font-mono"
                />
              </div>

              {errorMsg && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {errorMsg}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account
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

export default AdminRegisterPage;
