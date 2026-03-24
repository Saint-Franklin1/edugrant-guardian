import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
    { label: 'Special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const allValid = passwordChecks.every(c => c.valid) && password === confirm;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated successfully' });
      navigate('/');
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <img src={logo} alt="Elimu Vault" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <Button variant="link" onClick={() => navigate('/login')}>Back to login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src={logo} alt="Elimu Vault" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold">Set New Password</h1>
        </div>
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {passwordChecks.map(c => (
                  <div key={c.label} className={`flex items-center gap-2 text-xs ${c.valid ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className={`h-3 w-3 ${c.valid ? 'text-green-600' : 'text-muted-foreground/40'}`} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              {confirm && password !== confirm && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
            </div>
            <Button type="submit" className="w-full" disabled={!allValid || loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
