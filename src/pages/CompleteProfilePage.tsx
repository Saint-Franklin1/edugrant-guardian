import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

interface County { id: string; name: string; }
interface Constituency { id: string; name: string; county_id: string; }
interface Ward { id: string; name: string; constituency_id: string; }

const CompleteProfilePage = () => {
  const { user, profile, role, roles, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = roles.includes('admin');

  // Block admin without admin_level - redirect to selection page
  useEffect(() => {
    if (isAdmin && profile && !profile.admin_level) {
      navigate('/select-admin-level', { replace: true });
    }
  }, [isAdmin, profile, navigate]);

  const [name, setName] = useState(profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || '');
  const [selectedCountyId, setSelectedCountyId] = useState('');
  const [selectedConstituencyId, setSelectedConstituencyId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');

  const [counties, setCounties] = useState<County[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  const isChiefOrAdmin = roles.includes('chief') || roles.includes('admin');

  useEffect(() => {
    supabase.from('counties').select('*').order('name').then(({ data }) => setCounties(data || []));
  }, []);

  useEffect(() => {
    setSelectedConstituencyId('');
    setSelectedWardId('');
    setConstituencies([]);
    setWards([]);
    if (!selectedCountyId) return;
    supabase.from('constituencies').select('*').eq('county_id', selectedCountyId).order('name')
      .then(({ data }) => setConstituencies(data || []));
  }, [selectedCountyId]);

  useEffect(() => {
    setSelectedWardId('');
    setWards([]);
    if (!selectedConstituencyId) return;
    supabase.from('wards').select('*').eq('constituency_id', selectedConstituencyId).order('name')
      .then(({ data }) => setWards(data || []));
  }, [selectedConstituencyId]);

  const getSelectedNames = () => {
    const county = counties.find(c => c.id === selectedCountyId)?.name || '';
    const constituency = constituencies.find(c => c.id === selectedConstituencyId)?.name || '';
    const ward = wards.find(w => w.id === selectedWardId)?.name || '';
    return { county, constituency, ward };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountyId || !selectedConstituencyId || !selectedWardId || !name.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (!user) return;
    setLoading(true);

    const { county, constituency, ward } = getSelectedNames();

    // Update user metadata
    await supabase.auth.updateUser({
      data: { name, county, constituency, ward, role: role || 'user' },
    });

    // Upsert profile
    if (profile) {
      await supabase.from('profiles').update({ name, county, constituency, ward }).eq('user_id', user.id);
    } else {
      await supabase.from('profiles').insert({
        user_id: user.id, name, email: user.email, county, constituency, ward,
      });
    }

    // Refresh context and route
    await refreshProfile();
    setLoading(false);
    toast({ title: 'Profile completed!' });

    // Route based on role
    const primaryRole = role || 'user';
    if (primaryRole === 'admin') navigate('/admin', { replace: true });
    else if (primaryRole === 'chief') navigate('/chief', { replace: true });
    else navigate('/dashboard', { replace: true });
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
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
            </div>

            <div>
              <Label>County</Label>
              <Select value={selectedCountyId} onValueChange={setSelectedCountyId}>
                <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>
                  {counties.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Constituency</Label>
              <Select value={selectedConstituencyId} onValueChange={setSelectedConstituencyId} disabled={!selectedCountyId}>
                <SelectTrigger><SelectValue placeholder={selectedCountyId ? 'Select constituency' : 'Select county first'} /></SelectTrigger>
                <SelectContent>
                  {constituencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ward</Label>
              <Select value={selectedWardId} onValueChange={setSelectedWardId} disabled={!selectedConstituencyId}>
                <SelectTrigger><SelectValue placeholder={selectedConstituencyId ? 'Select ward' : 'Select constituency first'} /></SelectTrigger>
                <SelectContent>
                  {wards.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
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
