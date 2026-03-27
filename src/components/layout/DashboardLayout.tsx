import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User, Users, Home, Crown } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const roleConfig = {
    super_admin: { icon: Crown, label: 'Super Admin', color: 'bg-primary/10 text-primary' },
    admin: { icon: Shield, label: 'Administrator', color: 'bg-primary/10 text-primary' },
    chief: { icon: Users, label: 'Chief Verifier', color: 'bg-accent/10 text-accent' },
    user: { icon: User, label: 'Student', color: 'bg-info/10 text-info' },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
  const RoleIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">EV</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-base leading-tight">Elimu Vault</h1>
              <p className="text-xs text-muted-foreground leading-tight">Secure Bursary Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.color}`}>
              <RoleIcon className="h-4 w-4" />
              <span className="text-xs font-medium">{config.label}</span>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-tight">{profile?.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{profile?.email}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
