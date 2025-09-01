import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailVerification() {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(0);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkEmailVerification, sendEmailVerification } = useAuth();
  
  // Check if user is coming from signup
  const fromSignup = searchParams.get('from') === 'signup';
  const email = searchParams.get('email') || user?.email;

  useEffect(() => {
    // Start countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (user?.emailVerified) {
      navigate('/user');
    }
  }, [user, navigate]);

  const handleCheckVerification = async () => {
    if (!user) {
      toast({ 
        title: 'Error', 
        description: 'No user logged in', 
        variant: 'destructive' 
      });
      return;
    }

    setIsChecking(true);
    try {
      const isVerified = await checkEmailVerification();
      
      if (isVerified) {
        setVerificationStatus('verified');
        toast({ 
          title: 'Success!', 
          description: 'Your email has been verified. Redirecting to dashboard...' 
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/user');
        }, 2000);
      } else {
        setVerificationStatus('failed');
        toast({ 
          title: 'Not Verified Yet', 
          description: 'Please check your email and click the verification link' 
        });
      }
    } catch (error: any) {
      setVerificationStatus('failed');
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to check verification status', 
        variant: 'destructive' 
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) {
      toast({ 
        title: 'Error', 
        description: 'No user logged in', 
        variant: 'destructive' 
      });
      return;
    }

    setIsResending(true);
    try {
      await sendEmailVerification();
      toast({ 
        title: 'Email Sent!', 
        description: 'Verification email has been resent to your inbox' 
      });
      
      // Start countdown for resend button
      setCountdown(60);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to resend verification email', 
        variant: 'destructive' 
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (verificationStatus === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">Email Verified!</CardTitle>
            <CardDescription className="text-green-600">
              Your email has been successfully verified. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-green-200 rounded-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Verify Your Email</CardTitle>
          <CardDescription className="text-gray-600">
            {fromSignup 
              ? "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."
              : "Please verify your email address to continue using your account."
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email Display */}
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Verification email sent to:</p>
            <p className="font-semibold text-gray-800">{email}</p>
          </div>

          {/* Status Alert */}
          {verificationStatus === 'failed' && (
            <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Email not verified yet. Please check your inbox and click the verification link.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleCheckVerification} 
              disabled={isChecking}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Verification Status
                </>
              )}
            </Button>

            <Button 
              onClick={handleResendVerification} 
              disabled={isResending || countdown > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button 
              onClick={handleGoToLogin} 
              variant="ghost"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>Didn't receive the email?</p>
            <ul className="text-xs space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure the email address is correct</li>
              <li>• Wait a few minutes for delivery</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
