import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 DashboardRedirect - State:', { 
      user: user ? 'exists' : 'null', 
      isAuthenticated, 
      isLoading,
      userRole: user?.role 
    });

    if (!isLoading && isAuthenticated && user) {
      console.log('✅ User authenticated, redirecting based on role:', user.role);
      
      // Redirect based on user role
      if (user.role === 'admin') {
        console.log('👑 Redirecting admin to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('👤 Redirecting user to /user');
        navigate('/user', { replace: true });
      }
    } else if (!isLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login');
      // Redirect to login if not authenticated
      navigate('/login', { replace: true });
    } else {
      console.log('⏳ Still loading or waiting for auth state...');
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>User: {user ? 'exists' : 'null'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Role: {user?.role || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
