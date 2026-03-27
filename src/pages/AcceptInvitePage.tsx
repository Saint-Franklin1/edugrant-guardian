import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, Clock, Loader2, UserPlus } from 'lucide-react';
import logo from '@/assets/logo.png';

type InviteState = 'loading' | 'valid' | 'expired' | 'used' | 'invalid' | 'accepting' | 'success' | 'needs_signup';

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, refreshProfile } = useAuth();

  const [state, setState] = useState<InviteState>('loading');
  const [invitation, setInvitation] = useState<any>(null);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }

    const validateToken = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setState('invalid');
        return;
      }

      if (data.status === 'used') {
        setState('used');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setState('expired');
        return;
      }

      setInvitation(data);
      setSignupEmail(data.invited_email);

      if (user && user.email === data.invited_email) {
        // User is already logged in with correct email - accept immediately
        setState('valid');
      } else if (user && user.email !== data.invited_email) {
        // Logged in with wrong email
        toast({
          title: 'Wrong account',
          description: `This invitation is for ${data.invited_email}. Please sign out and use that email.`,
          variant: 'destructive',
        });
        setState('invalid');
      } else {
        // Not logged in - need to signup/login
        setState('needs_signup');
      }
    };

    validateToken();
  }, [token, user]);

  const handleAcceptInvite = async () => {
    if (!token || !session) return;

    setState('accepting');

    const { data, error } = await supabase.functions.invoke('accept-invite', {
      body: { token },
    });

    if (error || data?.error) {
      toast({
        title: 'Failed to accept invitation',
        description: data?.error || error?.message,
        variant: 'destructive',
      });
      setState('valid');
      return;
    }

    setState('success');
    toast({ title: 'Welcome to Elimu Vault!', description: 'Your admin account has been set up.' });
    await refreshProfile();

    setTimeout(() => navigate('/complete-profile', { replace: true }), 2000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) return;

    setSigningUp(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/accept-invite?token=${token}`,
        data: { name: signupName, role: 'user' },
      },
    });

    setSigningUp(false);
    if (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify, then return to this link.',
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) return;

    setSigningUp(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signupEmail,
      password: signupPassword,
    });

    setSigningUp(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    }
    // Auth state change will re-trigger the useEffect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="Elimu Vault Logo" className="h-20 w-auto mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold">Admin Invitation</h1>
        </div>

        {state === 'loading' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Validating invitation...</p>
            </CardContent>
          </Card>
        )}

        {state === 'invalid' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Invalid Invitation</h2>
              <p className="text-muted-foreground text-sm">This invitation link is invalid or you're logged in with a different email.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/login')}>Go to Login</Button>
            </CardContent>
          </Card>
        )}

        {state === 'expired' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Invitation Expired</h2>
              <p className="text-muted-foreground text-sm">This invitation has expired. Please contact the Super Admin for a new one.</p>
            </CardContent>
          </Card>
        )}

        {state === 'used' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Already Accepted</h2>
              <p className="text-muted-foreground text-sm">This invitation has already been used.</p>
              <Button className="mt-4" onClick={() => navigate('/login')}>Go to Login</Button>
            </CardContent>
          </Card>
        )}

        {state === 'needs_signup' && invitation && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading">Welcome, Admin</CardTitle>
              <CardDescription>
                You've been invited as a <span className="font-medium capitalize">{invitation.admin_level}</span> Admin
                {invitation.county && ` for ${invitation.county}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label>Email (pre-filled from invitation)</Label>
                  <Input value={signupEmail} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Your full name" required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Create a strong password" required />
                </div>
                <Button type="submit" className="w-full" disabled={signingUp}>
                  {signingUp ? 'Creating account...' : 'Create Account & Accept'}
                </Button>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or if you already have an account</span></div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleLogin} disabled={signingUp || !signupPassword}>
                Sign In & Accept
              </Button>
            </CardContent>
          </Card>
        )}

        {state === 'valid' && invitation && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading">Accept Invitation</CardTitle>
              <CardDescription>
                You're invited as a <span className="font-medium capitalize">{invitation.admin_level}</span> Admin
                for {invitation.county}
                {invitation.constituency && ` > ${invitation.constituency}`}
                {invitation.ward && ` > ${invitation.ward}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Role', value: 'Administrator' },
                  { label: 'Level', value: invitation.admin_level },
                  { label: 'County', value: invitation.county },
                  ...(invitation.constituency ? [{ label: 'Constituency', value: invitation.constituency }] : []),
                  ...(invitation.ward ? [{ label: 'Ward', value: invitation.ward }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleAcceptInvite} className="w-full" size="lg">
                Accept & Continue
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                ⚠️ Your role and jurisdiction cannot be changed after acceptance.
              </p>
            </CardContent>
          </Card>
        )}

        {state === 'accepting' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Setting up your admin account...</p>
            </CardContent>
          </Card>
        )}

        {state === 'success' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Welcome to Elimu Vault!</h2>
              <p className="text-muted-foreground text-sm">Your admin account is ready. Redirecting to complete your profile...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;
