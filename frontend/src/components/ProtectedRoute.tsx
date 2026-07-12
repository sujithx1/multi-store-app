import React from 'react';

interface ProtectedRouteProps {
  user: { username: string; role: 'Admin' | 'Shopper' } | null;
  allowedRoles?: ('Admin' | 'Shopper')[];
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export default function ProtectedRoute({
  user,
  allowedRoles,
  fallback,
  children,
}: ProtectedRouteProps) {
  if (!user) {
    return <>{fallback}</>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--accent-rose)', marginBottom: '1rem', fontWeight: 600 }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            You do not have permission to view this view. Required role: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
