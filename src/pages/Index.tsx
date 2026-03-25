import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { isProfileComplete } from '@/lib/profile-utils';

const Index = () => {
  const { user, role, roles, profile, loading } = useAuth();

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

  const isAdmin = roles.includes('admin');

  // Admin must select admin_level first
  if (isAdmin && (!profile || !profile.admin_level)) {
    return <Navigate to="/select-admin-level" replace />;
  }

  // Redirect to complete profile if location data is missing per role
  if (!isProfileComplete(profile, role, roles)) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Route based on highest-priority role from database
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'chief') return <Navigate to="/chief" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default Index;
