// client/components/ProtectedRoute.tsx
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string | string[];
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredRole,
  fallback 
}) => {
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('🔄 ProtectedRoute - Checking auth:', {
    isAuthenticated,
    userRole: user?.role,
    requiredRole,
    pathname: location.pathname
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('❌ User role insufficient:', user?.role, 'required:', requiredRole);
    const UnauthorizedComponent = fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have the required role to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Required role:</strong> {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Your role:</strong> {user?.role || 'Unknown'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (user?.role === 'admin') {
                      window.location.href = '/admin';
                    } else {
                      window.location.href = '/user';
                    }
                  }}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
    
    return UnauthorizedComponent;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('❌ User permission insufficient:', requiredPermission);
    const UnauthorizedComponent = fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Insufficient Permissions
            </CardTitle>
            <CardDescription>
              You don't have the required permissions to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Required permission:</strong> {requiredPermission}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Contact your administrator to request access to this feature.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (user?.role === 'admin') {
                      window.location.href = '/admin';
                    } else {
                      window.location.href = '/user';
                    }
                  }}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
    
    return UnauthorizedComponent;
  }

  // User is authenticated and authorized
  console.log('✅ User authorized, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;