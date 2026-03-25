import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isProfileComplete } from '@/lib/profile-utils';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, roles, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-primary-foreground font-heading font-bold text-sm">EV</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Admin must select level first
  if (roles.includes('admin') && (!profile || !profile.admin_level)) {
    return <Navigate to="/select-admin-level" replace />;
  }

  // Check profile completeness based on role and admin_level
  if (!isProfileComplete(profile, role, roles)) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(r => roles.includes(r));
    if (!hasAccess) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
