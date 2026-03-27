/** Check if a user's profile is complete based on their role and admin_level */
export const isProfileComplete = (profile: {
  county?: string;
  constituency?: string;
  ward?: string;
  admin_level?: string | null;
} | null, role: string | null, roles: string[]): boolean => {
  if (!profile) return false;

  // Super admin doesn't need profile completion
  if (roles.includes('super_admin')) return true;

  const isAdmin = roles.includes('admin');
  const isChief = roles.includes('chief');

  if (isAdmin) {
    if (!profile.admin_level) return false;
    if (profile.admin_level === 'county') return !!profile.county;
    if (profile.admin_level === 'constituency') return !!profile.county && !!profile.constituency;
    if (profile.admin_level === 'ward') return !!profile.county && !!profile.constituency && !!profile.ward;
    return false;
  }

  if (isChief) {
    return !!profile.county && !!profile.constituency && !!profile.ward;
  }

  // Regular user
  return !!profile.county && !!profile.constituency && !!profile.ward;
};

/** Get the scope label for admin/chief dashboards */
export const getScopeLabel = (profile: {
  county?: string;
  constituency?: string;
  ward?: string;
  admin_level?: string | null;
} | null, role: string | null): string => {
  if (!profile) return '';

  if (role === 'super_admin') return 'All of Kenya — Global Access';

  if (role === 'admin') {
    if (profile.admin_level === 'county') return `County: ${profile.county}`;
    if (profile.admin_level === 'constituency') return `Constituency: ${profile.constituency}, ${profile.county}`;
    if (profile.admin_level === 'ward') return `Ward: ${profile.ward}, ${profile.constituency}`;
  }

  if (role === 'chief') {
    return `Ward: ${profile.ward}, ${profile.constituency}`;
  }

  return '';
};
