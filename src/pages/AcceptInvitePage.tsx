import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Loader2, Shield, Crown, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

type InviteState = 'loading' | 'show_invite' | 'needs_auth' | 'accepting' | 'success' | 'expired' | 'used' | 'invalid' | 'error';

interface Invitation {
  id: string;
  invited_email: string;
  phone: string | null;
  role: 'admin' | 'chief';
  admin_level: string;
  county: string;
  constituency: string | null;
  ward: string | null;
  expires_at: string;
  status: string;
}

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, refreshProfile, loading: authLoading } = useAuth();

  const [state, setState] = useState<InviteState>('loading');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [formLoading, setFormLoading] = useState(false);
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const acceptedRef = useRef(false);

  // Fetch invitation details
  useEffect(() => {
    if (!token) {
      setState('invalid');
      setErrorMsg('No invitation token found in the URL.');
      return;
    }

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setState('invalid');
        setErrorMsg('This invitation link is invalid or has been deleted.');
        return;
      }

      const inv = data as Invitation;
      setInvitation(inv);
      setEmail(inv.invited_email);

      if (inv.status === 'used') {
        setState('used');
        return;
      }

      if (new Date(inv.expires_at) < new Date()) {
        setState('expired');
        return;
      }

      if (inv.status !== 'pending') {
        setState('invalid');
        setErrorMsg('This invitation is no longer valid.');
        return;
      }

      setState('show_invite');
    };

    fetchInvitation();
  }, [token]);

  // Auto-accept once user is authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!session || !user || !invitation) return;
    if (state !== 'show_invite' && state !== 'needs_auth') return;
    if (acceptedRef.current) return;

    // Verify email matches
    if (user.email?.toLowerCase() !== invitation.invited_email.toLowerCase()) {
      setState('invalid');
      setErrorMsg(`This invitation was sent to ${invitation.invited_email}. You are logged in as ${user.email}. Please log out and use the correct account.`);
      return;
    }

    acceptedRef.current = true;
    acceptInvitation();
  }, [session, user, invitation, state, authLoading]);

  const acceptInvitation = async () => {
    if (!invitation || !user) return;
    
    setState('accepting');

    try {
      // 1. Insert user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: invitation.role });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw new Error(`Failed to assign role: ${roleError.message}`);
      }

      // 2. Update profile with admin level and jurisdiction
      const profileUpdate: Record<string, string | null> = {
        admin_level: invitation.admin_level,
        county: invitation.county,
        constituency: invitation.constituency || '',
        ward: invitation.ward || '',
      };

      if (invitation.phone) {
        profileUpdate.phone = invitation.phone;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // 3. Mark invitation as used
      await supabase
        .from('invitations')
        .update({ status: 'used' })
        .eq('id', invitation.id);

      setState('success');
      toast({ title: 'Welcome to Elimu Vault!', description: `Your ${invitation.role} account has been set up.` });
      await refreshProfile();

      setTimeout(() => navigate('/complete-profile', { replace: true }), 2000);
    } catch (err: any) {
      setState('error');
      setErrorMsg(err?.message || 'Failed to accept invitation');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    setFormLoading(true);

    try {
      if (authMode === 'register') {
        if (!name.trim()) {
          toast({ title: 'Name required', variant: 'destructive' });
          setFormLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: invitation.invited_email,
          password,
          options: {
            data: { name: name.trim() },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: 'Account exists', description: 'Please log in instead.', variant: 'destructive' });
            setAuthMode('login');
          } else {
            toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
          }
          setFormLoading(false);
          return;
        }

        // Sign up successful - auto-login happens via onAuthStateChange
        setState('needs_auth');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: invitation.invited_email,
          password,
        });

        if (error) {
          toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
          setFormLoading(false);
          return;
        }

        setState('needs_auth');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="Elimu Vault Logo" className="h-20 w-auto mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold">Staff Invitation</h1>
        </div>

        {(state === 'loading' || state === 'accepting' || state === 'needs_auth') && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">
                {state === 'loading' ? 'Loading invitation...' : 
                 state === 'needs_auth' ? 'Verifying your account...' : 
                 'Setting up your account...'}
              </p>
            </CardContent>
          </Card>
        )}

        {state === 'show_invite' && invitation && !session && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {invitation.role === 'chief' ? (
                  <Crown className="h-6 w-6 text-primary" />
                ) : (
                  <Shield className="h-6 w-6 text-primary" />
                )}
              </div>
              <CardTitle className="text-lg">
                {invitation.role === 'chief' ? 'Chief' : 'Administrator'} Invitation
              </CardTitle>
              <CardDescription>
                You have been invited to join as a {invitation.admin_level} {invitation.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {invitation.county}
                    {invitation.constituency && ` > ${invitation.constituency}`}
                    {invitation.ward && ` > ${invitation.ward}`}
                  </span>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">This invitation is for this email only</p>
                </div>

                {authMode === 'register' && (
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder={authMode === 'register' ? 'Create a password' : 'Enter your password'}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  ) : authMode === 'register' ? (
                    'Create Account & Accept'
                  ) : (
                    'Log In & Accept'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {authMode === 'register' ? (
                    <>Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="text-primary font-medium hover:underline">Log in</button></>
                  ) : (
                    <>Need an account? <button type="button" onClick={() => setAuthMode('register')} className="text-primary font-medium hover:underline">Register</button></>
                  )}
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {state === 'success' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Welcome to Elimu Vault!</h2>
              <p className="text-muted-foreground text-sm">Your account is ready. Redirecting to complete your profile...</p>
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

        {state === 'expired' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Invitation Expired</h2>
              <p className="text-muted-foreground text-sm">This invitation has expired. Please contact the Super Admin for a new one.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/login')}>Go to Login</Button>
            </CardContent>
          </Card>
        )}

        {(state === 'invalid' || state === 'error') && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">
                {state === 'invalid' ? 'Invalid Invitation' : 'Something Went Wrong'}
              </h2>
              <p className="text-muted-foreground text-sm">{errorMsg || 'This invitation link is invalid.'}</p>
              <div className="flex gap-2 justify-center mt-4">
                {errorMsg.includes('logged in as') && (
                  <Button variant="destructive" onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}>Log Out</Button>
                )}
                <Button variant="outline" onClick={() => navigate('/login')}>Go to Login</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;
