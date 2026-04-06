import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import logo from '@/assets/elimu-vault-logo.png';

type CallbackState = 'verifying' | 'accepting' | 'success' | 'expired' | 'used' | 'email_mismatch' | 'invalid' | 'error';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        // Step 1: Force sign out any existing session to prevent contamination
        await supabase.auth.signOut();

        // Step 2: Exchange the code/token for a session
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (exchangeError || !sessionData?.user) {
          // Fallback: try to get session from URL hash (magic link flow)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: setData, error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setError || !setData?.user) {
              setState('error');
              setErrorMsg('Failed to establish session. Please try again.');
              return;
            }
            await processInvite(setData.user);
          } else {
            setState('error');
            setErrorMsg(exchangeError?.message || 'Failed to verify your invitation link.');
            return;
          }
        } else {
          await processInvite(sessionData.user);
        }
      } catch (err: any) {
        setState('error');
        setErrorMsg(err?.message || 'An unexpected error occurred.');
      }
    };

    handleCallback();
  }, []);

  const processInvite = async (user: any) => {
    setState('accepting');

    // Step 3: Find invitation token from URL
    const urlParams = new URLSearchParams(window.location.search);
    let inviteToken = urlParams.get('token');

    // Also check hash params
    if (!inviteToken) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      inviteToken = hashParams.get('token');
    }

    if (!inviteToken) {
      // No invite token – this is a regular auth callback, just redirect
      navigate('/', { replace: true });
      return;
    }

    // Step 4: Fetch and validate invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', inviteToken)
      .single();

    if (fetchError || !invitation) {
      setState('invalid');
      setErrorMsg('Invalid invitation link.');
      return;
    }

    if (invitation.status === 'used') {
      setState('used');
      return;
    }

    if (new Date(invitation.expires_at) < new Date()) {
      setState('expired');
      return;
    }

    // Step 5: Email must match
    if (user.email !== invitation.invited_email) {
      await supabase.auth.signOut();
      setState('email_mismatch');
      setErrorMsg(`Wrong email used. Please use the invited email: ${invitation.invited_email}`);
      return;
    }

    // Step 6: Accept invite via edge function
    const { data, error } = await supabase.functions.invoke('accept-invite', {
      body: { token: inviteToken },
    });

    if (error || data?.error) {
      const msg = data?.error || error?.message || 'Failed to accept invitation';
      if (msg.includes('already been used')) { setState('used'); return; }
      if (msg.includes('expired')) { setState('expired'); return; }
      setState('error');
      setErrorMsg(msg);
      return;
    }

    setState('success');

    // Step 7: Redirect to complete profile
    setTimeout(() => navigate('/complete-profile', { replace: true }), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="Elimu Vault" className="h-16 w-16 mx-auto mb-3 rounded-lg object-contain" />
          <h1 className="font-heading text-2xl font-bold">Staff Invitation</h1>
        </div>

        {(state === 'verifying' || state === 'accepting') && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {state === 'verifying' ? 'Verifying invitation…' : 'Setting up your account…'}
              </p>
            </CardContent>
          </Card>
        )}

        {state === 'success' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Welcome to Elimu Vault!</h2>
              <p className="text-muted-foreground text-sm">Your account is ready. Redirecting…</p>
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
              <p className="text-muted-foreground text-sm">This invitation has expired. Contact the Super Admin for a new one.</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate('/login')}>Go to Login</Button>
            </CardContent>
          </Card>
        )}

        {state === 'email_mismatch' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold mb-2">Wrong Email</h2>
              <p className="text-muted-foreground text-sm">{errorMsg}</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate('/login')}>Go to Login</Button>
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

export default AuthCallbackPage;
