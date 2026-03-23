import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, role, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-primary-foreground font-heading font-bold">EV</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // If user has no profile or incomplete location, redirect to complete profile
  if (!profile || !profile.county || !profile.ward) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'chief') return <Navigate to="/chief" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default Index;
