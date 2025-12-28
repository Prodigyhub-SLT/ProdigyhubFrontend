import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Validation states
  const [emailValidation, setEmailValidation] = useState({ isValid: false, isTouched: false, message: '' });
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, isTouched: false, message: '' });
  const [nicValidation, setNicValidation] = useState({ isValid: false, isTouched: false, message: '' });
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, isTouched: false, message: '' });
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, isTouched: false, message: '' });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, loginWithGoogle } = useAuth();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { isValid: false, message: 'Email is required' };
    if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' };
    return { isValid: true, message: 'Email looks good!' };
  };

  // Enhanced Sri Lankan mobile phone validation
  const validatePhone = (phone: string): { isValid: boolean; message: string } => {
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length === 0) {
      return { isValid: false, message: 'Phone number is required' };
    }

    if (digitsOnly.length !== 10) {
      return { isValid: false, message: 'Phone number must be exactly 10 digits' };
    }

    if (!digitsOnly.startsWith('07')) {
      return { isValid: false, message: 'Phone must start with 07' };
    }

    const thirdDigit = digitsOnly[2];
    const validThirdDigits = ['0', '1', '2', '5', '6', '7', '8']; // Valid SL mobile operators
    if (!validThirdDigits.includes(thirdDigit)) {
      return { isValid: false, message: 'Invalid mobile operator code' };
    }

    return { isValid: true, message: 'Valid Sri Lankan mobile number!' };
  };

  // NIC validation (Old: 9 digits + V/X, New: 12 digits)
  const validateNic = (nic: string): { isValid: boolean; message: string } => {
    const trimmed = nic.trim().toUpperCase().replace(/\s/g, '');

    if (!trimmed) return { isValid: false, message: 'NIC number is required' };

    const oldFormat = /^[0-9]{9}[VX]$/;
    const newFormat = /^[0-9]{12}$/;

    if (oldFormat.test(trimmed) || newFormat.test(trimmed)) {
      return { isValid: true, message: 'NIC looks good!' };
    }

    return { isValid: false, message: 'Invalid NIC. Use 9 digits + V/X (old) or 12 digits (new)' };
  };

  // Password match validation
  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (!password) return { isValid: false, message: 'Password is required' };
    if (!confirmPassword) return { isValid: false, message: 'Please confirm your password' };
    if (password !== confirmPassword) return { isValid: false, message: 'Passwords do not match' };
    return { isValid: true, message: 'Passwords match!' };
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digitsOnly }));

      const validation = validatePhone(digitsOnly);
      setPhoneValidation({
        isValid: validation.isValid,
        isTouched: true,
        message: validation.message
      });
    }
    else if (field === 'nic') {
      const normalized = value.toUpperCase().replace(/\s/g, '');
      setFormData(prev => ({ ...prev, nic: normalized }));

      const validation = validateNic(normalized);
      setNicValidation({
        isValid: validation.isValid,
        isTouched: true,
        message: validation.message
      });
    }
    else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Real-time validations
    if (field === 'email') {
      const validation = validateEmail(value);
      setEmailValidation({ isValid: validation.isValid, isTouched: true, message: validation.message });
    }

    if (field === 'password') {
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\[\]{}\-_=+,.?;:]).{8,}$/;
      const isStrong = strongRegex.test(value);
      setPasswordStrength({
        isValid: isStrong,
        isTouched: true,
        message: isStrong ? 'Strong password' : 'Use 8+ chars incl. upper, lower, number, and symbol'
      });
    }

    if (field === 'password' || field === 'confirmPassword') {
      const currentPassword = field === 'password' ? value : formData.password;
      const currentConfirm = field === 'confirmPassword' ? value : formData.confirmPassword;
      const validation = validatePasswordMatch(currentPassword, currentConfirm);
      setPasswordValidation({
        isValid: validation.isValid,
        isTouched: true,
        message: validation.message
      });
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) { setError('First name is required'); return false; }
    if (!formData.lastName.trim()) { setError('Last name is required'); return false; }
    if (!formData.email.trim()) { setError('Email is required'); return false; }
    if (!emailValidation.isValid) { setError('Invalid email address'); return false; }

    // Phone validation
    const phoneVal = validatePhone(formData.phone);
    if (!phoneVal.isValid) { setError(phoneVal.message); return false; }

    // NIC validation
    const nicVal = validateNic(formData.nic);
    if (!nicVal.isValid) { setError(nicVal.message); return false; }

    // Password strength
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\[\]{}\-_=+,.?;:]).{8,}$/;
    if (!strongRegex.test(formData.password)) {
      setError('Password is too weak. Use 8+ chars with upper, lower, number, and symbol.');
      return false;
    }

    if (!passwordValidation.isValid) { setError('Passwords do not match'); return false; }
    if (!agreeToTerms) { setError('You must agree to the Terms and Privacy Policy'); return false; }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.firstName, formData.lastName, formData.phone, formData.nic);
      toast({ title: 'Account Created Successfully!', description: 'Please check your email to verify your account' });
      navigate(`/verify-email?from=signup&email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      toast({ title: 'Sign-up Failed', description: err.message || 'Failed to create account', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: 'Google Sign-up Successful!', description: 'Welcome to SLT Prodigy Hub' });
      navigate('/user?tab=qualification&from=signup');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed.');
      toast({ title: 'Google Sign-up Failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <img src="/images/SLTBG.png" alt="SLT Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-lg p-8 space-y-6 shadow-lg">
          {/* Header */}
          <div className="space-y-4 text-center">
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
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          </div>

          {/* Google Button */}
          <Button type="button" variant="outline" onClick={handleGoogleSignUp} disabled={isGoogleLoading} className="w-full ...">
            {/* ... Google button content ... */}
          </Button>

          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500">or</span></div></div>

          {error && <Alert className="border-red-200 bg-red-50 text-red-700"><AlertDescription className="text-sm">{error}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Names */}
            <div className="grid grid-cols-2 gap-4">{/* First & Last Name inputs */}</div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Input id="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required disabled={isLoading}
                  className={`pr-12 ... ${emailValidation.isTouched ? emailValidation.isValid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500' : ''}`} />
                {emailValidation.isTouched && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValidation.isValid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                )}
              </div>
              {emailValidation.isTouched && <p className={`text-xs ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>{emailValidation.message}</p>}
            </div>

            {/* Phone Number - Enhanced Validation */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 text-sm">Phone Number *</Label>
              <div className="relative">
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="e.g. 0771234567" 
                  value={formData.phone} 
                  onChange={(e) => handleInputChange('phone', e.target.value)} 
                  required 
                  disabled={isLoading}
                  maxLength={10}
                  className={`border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 pr-12 focus:ring-blue-500 ${
                    phoneValidation.isTouched 
                      ? phoneValidation.isValid 
                        ? 'focus:border-green-500 border-green-500' 
                        : 'focus:border-red-500 border-red-500' 
                      : 'focus:border-blue-500'
                  }`}
                />
                {phoneValidation.isTouched && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {phoneValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {phoneValidation.isTouched && (
                <p className={`text-xs ${phoneValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {phoneValidation.message}
                </p>
              )}
            </div>

            {/* NIC - Already enhanced */}
            <div className="space-y-2">
              <Label htmlFor="nic">NIC Number *</Label>
              <div className="relative">
                <Input 
                  id="nic" 
                  type="text" 
                  placeholder="e.g. 123456789V or 200012345678" 
                  value={formData.nic} 
                  onChange={(e) => handleInputChange('nic', e.target.value)} 
                  required 
                  disabled={isLoading}
                  className={`pr-12 ... ${nicValidation.isTouched ? nicValidation.isValid ? 'border-green-500' : 'border-red-500' : ''}`}
                />
                {nicValidation.isTouched && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nicValidation.isValid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                )}
              </div>
              {nicValidation.isTouched && <p className={`text-xs ${nicValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>{nicValidation.message}</p>}
            </div>

            {/* Password fields remain the same */}
            {/* ... Password and Confirm Password ... */}

            {/* Terms Checkbox & Submit Button */}
            {/* ... rest of form ... */}
          </form>
        </div>

        <div className="text-center mt-4">
          <p className="text-white text-sm">
            Already have an account? <Link to="/login" className="text-blue-400 hover:underline font-medium">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}