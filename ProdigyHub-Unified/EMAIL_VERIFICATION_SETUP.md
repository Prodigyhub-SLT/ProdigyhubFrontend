# Email Verification Setup Guide

## Overview
This guide explains how to set up email verification for your SLT Prodigy Hub application using different email providers.

## 🚀 **What's Implemented**

### **1. Complete Email Verification System**
- ✅ User signup creates unverified account
- ✅ Verification email sent automatically
- ✅ Email verification link with JWT token
- ✅ Account activation after verification
- ✅ Welcome email after verification
- ✅ Resend verification functionality
- ✅ Only verified users can login

### **2. New API Endpoints**
- `GET /users/verify-email/:token` - Verify email with token
- `POST /users/resend-verification` - Resend verification email
- `POST /users/login` - Now requires email verification

### **3. User Model Updates**
- `isEmailVerified` - Boolean flag for verification status
- `emailVerificationToken` - JWT token for verification
- `emailVerificationExpires` - Token expiration time
- `emailVerificationDate` - When email was verified
- `status` - Now defaults to 'unverified'

## 📧 **Email Provider Setup**

### **Option 1: Gmail (Recommended for Development)**

#### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification

#### **Step 2: Generate App Password**
1. Go to Security → App passwords
2. Select "Mail" and "Other (Custom name)"
3. Enter "SLT Prodigy Hub" as the name
4. Click "Generate"
5. Copy the 16-character password

#### **Step 3: Environment Variables**
```bash
# .env file
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### **Option 2: Outlook/Hotmail**

#### **Step 1: Enable App Passwords**
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Enable 2-Step Verification
3. Generate an app password

#### **Step 2: Environment Variables**
```bash
# .env file
EMAIL_PROVIDER=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-app-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### **Option 3: Custom SMTP Server**

#### **Step 1: Get SMTP Details**
Contact your email provider for:
- SMTP Host (e.g., smtp.gmail.com)
- SMTP Port (usually 587 or 465)
- Username and password

#### **Step 2: Environment Variables**
```bash
# .env file
EMAIL_PROVIDER=custom
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🔧 **Vercel Deployment Setup**

### **Step 1: Add Environment Variables in Vercel**
1. Go to your Vercel dashboard
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add these variables:

```bash
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### **Step 2: Deploy**
```bash
git add .
git commit -m "🔐 Add email verification system"
git push origin main
```

Vercel will automatically:
- Install new dependencies (nodemailer, jsonwebtoken)
- Deploy with email verification
- Make new endpoints available

## 📱 **Frontend Integration**

### **Step 1: Create Verification Page**
Create `/verify-email` page in your frontend:

```jsx
// pages/VerifyEmail.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`/api/users/verify-email/${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center text-green-600">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center text-red-600">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### **Step 2: Update SignUp Page**
Show verification message after signup:

```jsx
// After successful signup
toast({ 
  title: 'Account Created!', 
  description: 'Please check your email to verify your account before logging in.',
  variant: 'default'
});
```

### **Step 3: Update Login Page**
Handle unverified user errors:

```jsx
// In login error handling
if (error.response?.status === 403 && error.response?.data?.needsVerification) {
  setError('Please verify your email address before logging in. Check your inbox for the verification email.');
  // Show resend verification option
}
```

## 🧪 **Testing Email Verification**

### **Test 1: User Signup**
```bash
curl -X POST https://your-backend.vercel.app/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "password": "testpassword123",
    "userId": "test-123"
  }'
```

**Expected Result:**
- User created with status "unverified"
- Verification email sent
- User cannot login yet

### **Test 2: Email Verification**
```bash
# Copy the verification link from the email
# Or use the token directly:
curl -X GET "https://your-backend.vercel.app/users/verify-email/YOUR_TOKEN_HERE"
```

**Expected Result:**
- Email verified
- Status changed to "active"
- Welcome email sent
- User can now login

### **Test 3: Login with Unverified Account**
```bash
curl -X POST https://your-backend.vercel.app/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Expected Result:**
- 403 error with "Email Not Verified" message

### **Test 4: Resend Verification**
```bash
curl -X POST https://your-backend.vercel.app/users/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Result:**
- New verification email sent
- Token updated in database

## 🔒 **Security Features**

### **1. JWT Token Security**
- Tokens expire in 24 hours
- Unique tokens per verification attempt
- Signed with secret key

### **2. Email Verification**
- Only verified users can login
- Verification required for account activation
- Resend functionality for expired tokens

### **3. Rate Limiting (Recommended)**
Add rate limiting to prevent abuse:

```javascript
// In your server.js
const rateLimit = require('express-rate-limit');

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many verification attempts, please try again later'
});

app.use('/users/verify-email', verificationLimiter);
app.use('/users/resend-verification', verificationLimiter);
```

## 📊 **Monitoring and Logs**

### **Console Logs to Watch**
- 📧 Email sending success/failure
- 🔐 Verification token generation
- ✅ Email verification success
- ❌ Verification failures
- 🎉 Welcome email delivery

### **Database Changes**
- Check `users` collection for verification status
- Monitor `isEmailVerified` field changes
- Track verification token usage

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Emails Not Sending**
   - Check email provider credentials
   - Verify SMTP settings
   - Check Vercel environment variables

2. **Verification Links Not Working**
   - Ensure FRONTEND_URL is correct
   - Check JWT_SECRET is set
   - Verify token expiration

3. **Users Can't Login**
   - Check if email is verified
   - Verify account status is "active"
   - Check verification token expiration

## 🎯 **Next Steps**

1. **Set up email provider** (Gmail recommended for testing)
2. **Configure environment variables** in Vercel
3. **Deploy backend** with email verification
4. **Create frontend verification page**
5. **Test the complete flow**
6. **Monitor email delivery** and verification success

## 🎉 **Benefits**

- ✅ **Enhanced Security** - Prevents fake accounts
- ✅ **User Trust** - Verified email addresses
- ✅ **Compliance** - Meets security standards
- ✅ **Professional** - Industry-standard practice
- ✅ **Scalable** - Works with any email provider

Your email verification system is now ready for production! 🚀🔐
