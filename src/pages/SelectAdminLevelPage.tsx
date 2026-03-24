import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, MapPin, Building, Globe } from 'lucide-react';
import logo from '@/assets/logo.png';

const levels = [
  { value: 'ward', label: 'Ward Admin', description: 'Manage applications within a single ward', icon: MapPin },
  { value: 'constituency', label: 'Constituency Admin', description: 'Manage applications across a constituency', icon: Building },
  { value: 'county', label: 'County Admin', description: 'Manage applications across an entire county', icon: Globe },
] as const;

const SelectAdminLevelPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected || !user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ admin_level: selected })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    toast({ title: 'Admin level set successfully' });
    navigate('/complete-profile', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="Elimu Vault Logo" className="h-20 w-auto mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Select Admin Level
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            This selection is permanent and cannot be changed later.
          </p>
        </div>

        <div className="space-y-3">
          {levels.map(level => (
            <Card
              key={level.value}
              className={`cursor-pointer transition-all ${
                selected === level.value
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelected(level.value)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`rounded-lg p-2 ${selected === level.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <level.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{level.label}</p>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleConfirm} className="w-full mt-6" disabled={!selected || saving}>
          {saving ? 'Setting...' : 'Confirm Admin Level'}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-3">
          ⚠️ This cannot be undone. Choose carefully.
        </p>
      </div>
    </div>
  );
};

export default SelectAdminLevelPage;
