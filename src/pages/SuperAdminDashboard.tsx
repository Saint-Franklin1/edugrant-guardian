import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Users, 
  Shield, 
  LayoutDashboard,
  UserCog,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import logo from '@/assets/elimu-vault-logo.png';

const SuperAdminDashboard = () => {
  const { user, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSystemStatus('checking');
      
      try {
        // Fetch total users count
        const { data, error, count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error fetching users:', error);
          setSystemStatus('offline');
        } else {
          setTotalUsers(count ?? 0);
          setSystemStatus('online');
        }
      } catch (err) {
        console.error('Error:', err);
        setSystemStatus('offline');
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Static Sidebar */}
      <aside className="w-64 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Elimu Vault" className="h-9 w-9 rounded-lg object-contain" />
            <div>
              <h1 className="font-semibold text-sm">Elimu Vault</h1>
              <p className="text-xs text-sidebar-foreground/60">Super Admin</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 cursor-not-allowed">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Admin Management</span>
            <span className="ml-auto text-xs bg-sidebar-accent px-1.5 py-0.5 rounded">Soon</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 cursor-not-allowed">
            <UserCog className="h-4 w-4" />
            <span className="text-sm">User Management</span>
            <span className="ml-auto text-xs bg-sidebar-accent px-1.5 py-0.5 rounded">Soon</span>
          </div>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/80">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-medium">
              {userData?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{userData?.email || 'Admin'}</p>
              <p className="text-xs text-sidebar-foreground/50">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <img src={logo} alt="Elimu Vault" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-semibold text-sm">Elimu Vault</span>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="text-muted-foreground hover:text-foreground h-9 w-9"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut} 
              className="text-muted-foreground hover:text-destructive h-9 w-9"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Welcome Message */}
          <Card className="mb-6 rounded-2xl shadow-sm bg-primary/5 border-primary/10">
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold mb-1">Welcome back, Super Admin</h3>
              <p className="text-sm text-muted-foreground">
                You have full system access to Elimu Vault. Manage the entire bursary system from here.
              </p>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {/* System Status */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {systemStatus === 'checking' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : systemStatus === 'online' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-destructive" />
                  )}
                  <span className="text-xl font-bold capitalize">
                    {systemStatus === 'checking' ? 'Checking...' : systemStatus}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Users */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      totalUsers ?? 0
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Connected As */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Logged In As</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium truncate">{userData?.email || user?.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Super Admin</p>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder Sections */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Admin Management Placeholder */}
            <Card className="rounded-2xl shadow-sm opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Admin Management</CardTitle>
                </div>
                <CardDescription>Manage system administrators and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 rounded-xl bg-muted/50 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </CardContent>
            </Card>

            {/* User Management Placeholder */}
            <Card className="rounded-2xl shadow-sm opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">User Management</CardTitle>
                </div>
                <CardDescription>View and manage all system users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 rounded-xl bg-muted/50 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
