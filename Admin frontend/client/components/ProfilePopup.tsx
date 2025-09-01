import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Settings, 
  Shield, 
  LogOut, 
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLDivElement>;
}

export default function ProfilePopup({ isOpen, onClose, triggerRef }: ProfilePopupProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleProfileClick = () => {
    onClose();
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    onClose();
    navigate('/settings');
  };

  const handlePrivacyPolicyClick = () => {
    onClose();
    // You can navigate to a privacy policy page or open in new tab
    window.open('/privacy-policy', '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Popup */}
      <Card className="absolute top-16 right-0 w-64 z-50 shadow-xl border border-gray-200 bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-gray-50"
              onClick={handleProfileClick}
            >
              <User className="w-4 h-4 mr-3 text-gray-600" />
              <span className="text-gray-700">Profile (Edit Profile)</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-gray-50"
              onClick={handleSettingsClick}
            >
              <Settings className="w-4 h-4 mr-3 text-gray-600" />
              <span className="text-gray-700">Settings</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-gray-50"
              onClick={handlePrivacyPolicyClick}
            >
              <Shield className="w-4 h-4 mr-3 text-gray-600" />
              <span className="text-gray-700">Privacy Policy</span>
            </Button>

            <div className="border-t border-gray-100 my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-red-50 text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Log Out</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
