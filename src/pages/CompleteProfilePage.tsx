import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { counties } from '@/lib/kenya-data';
import logo from '@/assets/logo.png';

const CompleteProfilePage = () => {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    county: '', constituency: '', ward: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.county || !form.constituency || !form.ward || !form.name) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (!user) return;
    setLoading(true);

    // Update user metadata
    await supabase.auth.updateUser({
      data: { name: form.name, county: form.county, constituency: form.constituency, ward: form.ward, role: 'user' },
    });

    // Update or insert profile
    if (profile) {
      await supabase.from('profiles').update({
        name: form.name, county: form.county, constituency: form.constituency, ward: form.ward,
      }).eq('user_id', user.id);
    } else {
      await supabase.from('profiles').insert({
        user_id: user.id, name: form.name, email: user.email,
        county: form.county, constituency: form.constituency, ward: form.ward,
      });
    }

    setLoading(false);
    toast({ title: 'Profile completed!' });
    // Force reload to pick up new profile
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="Elimu Vault Logo" className="h-20 w-auto mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">We need a few more details to get you started</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name (as on ID / Birth Certificate)</Label>
              <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" required />
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
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
