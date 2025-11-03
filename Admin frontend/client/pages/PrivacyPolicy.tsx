import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/user');
  };
  return (
    <div 
      id="page-background"
      className="min-h-screen py-8 transition-colors duration-500"
      style={{ 
        background: 'linear-gradient(135deg, var(--dynamic-bg-color, #3b82f6) 0%, rgba(0,0,0,0.8) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button (top-left) */}
        <div className="absolute top-8 left-8 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-10 w-10 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white drop-shadow">Privacy Policy</h1>
          <p className="text-white/80 mt-2">Your privacy matters. This page outlines how we handle your data.</p>
        </div>

        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Information We Collect</h2>
              <p className="text-sm">
                We collect account details you provide (such as name, email, and phone), basic usage metrics, and
                preferences you configure in the app. This information helps us personalize your experience and
                operate core features securely.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">How We Use Your Information</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Provide and improve app features (dashboards, packages, products, messages).</li>
                <li>Maintain account security and handle authentication.</li>
                <li>Offer support and notify you about important changes.</li>
                <li>Store your appearance preferences on your device.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Data Storage & Security</h2>
              <p className="text-sm">
                We use industry-standard security practices. Some preferences are stored locally in your browser to
                provide a faster experience. You can reset or remove these at any time from Settings.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Your Choices</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Update profile details in Edit Profile.</li>
                <li>Adjust appearance preferences in Settings.</li>
                <li>Contact support if you want your account removed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Contact</h2>
              <p className="text-sm">
                If you have questions about this policy, contact our support team through the Messages tab or your
                usual SLT-MOBITEL channels.
              </p>
            </section>

            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


