import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User, Users } from 'lucide-react';
import logo from '@/assets/logo.png';

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

  const roleIcon = role === 'admin' ? <Shield className="h-5 w-5" /> : role === 'chief' ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />;
  const roleLabel = role === 'admin' ? 'Administrator' : role === 'chief' ? 'Chief Verifier' : 'Student';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Elimu Vault" className="h-9 w-auto" />
            <h1 className="font-heading font-bold text-lg">Elimu Vault</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              {roleIcon}
              <span>{roleLabel}</span>
              <span className="text-border">|</span>
              <span>{profile?.name || profile?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container px-4 py-6 animate-fade-in">
        <h2 className="font-heading text-2xl font-bold mb-6">{title}</h2>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
