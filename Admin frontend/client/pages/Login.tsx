import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Shield, Zap, Lock, ArrowRight, Sparkles, Key, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, loginWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Remove the automatic redirect - let users always see the login form
  // The ProtectedRoute will handle redirects after successful login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    console.log('🚀 Form submitted with:', { email, password: '***' });
    
    try {
      console.log('📞 Calling login function...');
      await login(email, password);
      console.log('✅ Login successful!');
      
      toast({
        title: "Access Granted",
        description: "Welcome to SLT Prodigy Hub",
      });
      
      // Redirect based on email (since we know the mock user roles)
      if (email === 'admin@company.com') {
        console.log('👑 Admin user detected, redirecting to /admin');
        navigate('/admin');
      } else {
        console.log('👤 Regular user detected, redirecting to /user');
        navigate('/user');
      }
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      toast({
        title: "Access Denied",
        description: "Invalid credentials provided",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    
    try {
      console.log('🔐 Starting Google Sign-In...');
      await loginWithGoogle();
      console.log('✅ Google Sign-In successful!');
      
      toast({
        title: "Google Sign-In Successful",
        description: "Welcome to SLT Prodigy Hub",
      });
      
      // For Google users, they get 'user' role by default
      console.log('👤 Google user detected, redirecting to /user');
      navigate('/user');
      
    } catch (err) {
      console.error('❌ Google Sign-In failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Google Sign-In failed';
      setError(errorMessage);
      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/images/SLTBG.png" 
          alt="SLT Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Login Form Container */}
        <div className="bg-blue-800 rounded-lg p-8 space-y-6">
          {/* Header with Logo */}
          <div className="space-y-4">
            {/* SLTMOBITEL Logo */}
            <div className="flex justify-center">
              <div className="text-white text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-8 h-1 bg-blue-400 rounded"></div>
                  <div className="w-8 h-1 bg-green-400 rounded"></div>
                </div>
                <div className="text-2xl font-bold">SLTMOBITEL</div>
                <div className="text-sm">The Connection</div>
              </div>
            </div>
            
            {/* Sign In Heading */}
            <h1 className="text-2xl font-bold text-white">
              Sign In
            </h1>
          </div>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full bg-white text-gray-700 hover:bg-gray-50 border-gray-300 h-12 rounded-lg"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-blue-800 px-2 text-white">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-700">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Phone Number or Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm">
                Phone Number or Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your phone number or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-blue-700 border border-white/20 text-white placeholder:text-gray-300 h-12 focus:border-white/40 focus:ring-white/20"
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-blue-700 border border-white/20 text-white placeholder:text-gray-300 h-12 pr-12 focus:border-white/40 focus:ring-white/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-blue-600 text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Me and Forgot Password Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor="rememberMe" className="text-white text-sm">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-blue-400 text-sm hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button - Centered */}
            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg h-12 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Registration Link */}
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}