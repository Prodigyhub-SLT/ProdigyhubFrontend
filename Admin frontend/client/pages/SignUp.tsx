import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, googleProvider } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { createUserProfile } from '@/lib/firebase';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '0771234567',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      
      // Create user profile in database
      const userProfile = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'user',
        department: 'General',
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      
      await createUserProfile(userProfile);
      
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to SLT Prodigy Hub",
      });
      
      // Redirect to user dashboard
      navigate('/user');
      
    } catch (err: any) {
      console.error('Sign-up failed:', err);
      let errorMessage = 'Failed to create account';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      setError(errorMessage);
      toast({
        title: "Sign-up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create user profile in database
      const userProfile = {
        uid: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: formData.phone,
        role: 'user',
        department: 'General',
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      
      await createUserProfile(userProfile);
      
      toast({
        title: "Google Sign-up Successful!",
        description: "Welcome to SLT Prodigy Hub",
      });
      
      // Redirect to user dashboard
      navigate('/user');
      
    } catch (err: any) {
      console.error('Google Sign-up failed:', err);
      setError('Google sign-up failed. Please try again.');
      toast({
        title: "Google Sign-up Failed",
        description: "Please try again",
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
        {/* Sign Up Form Container */}
        <div className="bg-white rounded-lg p-8 space-y-6 shadow-lg">
          {/* Header with Logo */}
          <div className="space-y-4 text-center">
            {/* SLTMOBITEL Logo */}
            <div className="flex justify-center">
              <div className="text-gray-800 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-8 h-1 bg-blue-400 rounded"></div>
                  <div className="w-8 h-1 bg-green-400 rounded"></div>
                </div>
                <div className="text-2xl font-bold">SLTMOBITEL</div>
                <div className="text-sm">The Connection</div>
              </div>
            </div>
            
            {/* Sign Up Heading */}
            <h1 className="text-2xl font-bold text-gray-800">
              Create Account
            </h1>
          </div>

          {/* Google Sign-Up Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full bg-white text-gray-700 hover:bg-gray-50 border-gray-300 h-12 rounded-lg"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing Up...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </>
            )}
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-700">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Name Fields - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 text-sm">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 text-sm">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 text-sm">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 pr-12 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 text-gray-500"
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
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 text-sm">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 pr-12 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 mt-1"
              />
              <Label htmlFor="agreeToTerms" className="text-gray-700 text-sm leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Privacy Policy
                </a>
              </Label>
            </div>

            {/* Create Account Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg h-12 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
