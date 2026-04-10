import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

type InviteState = 'loading' | 'redirecting' | 'accepting' | 'success' | 'expired' | 'used' | 'invalid' | 'error';

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, refreshProfile } = useAuth();

  const [state, setState] = useState<InviteState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const acceptedRef = useRef(false);

  // Step 1: Capture token from URL or sessionStorage
  const token = tokenFromUrl || sessionStorage.getItem('invite_token');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      setErrorMsg('No invitation token found in the URL.');
      return;
    }

    // Always persist the token so it survives login redirect
    if (tokenFromUrl) {
      sessionStorage.setItem('invite_token', tokenFromUrl);
    }

    // If not authenticated, redirect to login
    if (!session || !user) {
      setState('redirecting');
      // Small delay to show redirecting state
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Authenticated — process the invite
    if (acceptedRef.current) return;
    acceptedRef.current = true;

    const acceptInvite = async () => {
      setState('accepting');

      try {
        console.log('[AcceptInvite] Processing invite for:', user.email);

        const { data, error } = await supabase.functions.invoke('accept-invite', {
          body: { token },
        });

        console.log('[AcceptInvite] Response:', { data, error });

        if (error || data?.error) {
          const msg = data?.error || error?.message || 'Unknown error';

          if (msg.includes('already been used')) {
            setState('used');
          } else if (msg.includes('expired')) {
            setState('expired');
          } else if (msg.includes('different email')) {
            setState('invalid');
            setErrorMsg(`This invitation was sent to a different email address. You are logged in as ${user.email}.`);
          } else {
            setState('error');
            setErrorMsg(msg);
          }
          return;
        }

        // Clean up
        sessionStorage.removeItem('invite_token');
        setState('success');
        toast({ title: 'Welcome to Elimu Vault!', description: `Your ${data.role} account has been set up.` });
        await refreshProfile();

        setTimeout(() => navigate('/complete-profile', { replace: true }), 2000);
      } catch (err: any) {
        console.error('[AcceptInvite] Error:', err);
        setState('error');
        setErrorMsg(err?.message || 'Failed to accept invitation');
      }
    };

    acceptInvite();
  }, [token, session, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold">Staff Invitation</h1>
        </div>

        {(state === 'loading' || state === 'accepting') && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">
                {state === 'loading' ? 'Verifying your identity...' : 'Setting up your account...'}
              </p>
            </CardContent>
          </Card>
        )}

        {state === 'redirecting' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">You need to log in first. Redirecting to login...</p>
              <p className="text-xs text-muted-foreground mt-2">Your invitation will be processed after you sign in.</p>
            </CardContent>
          </Card>
        )}

        {state === 'success' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Welcome to Elimu Vault!</h2>
              <p className="text-muted-foreground text-sm">Your account is ready. Redirecting to complete your profile...</p>
            </CardContent>
          </Card>
        )}

        {state === 'used' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
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
              <Button variant="outline" className="mt-4" onClick={() => navigate('/login')}>Go to Login</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;
