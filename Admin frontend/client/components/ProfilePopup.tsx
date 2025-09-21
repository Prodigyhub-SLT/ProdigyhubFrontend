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
    navigate('/user/profile');
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
      <Card className="absolute top-12 right-0 w-72 md:w-80 z-50 shadow-xl border border-blue-300 bg-gradient-to-br from-blue-600 to-blue-700 
                       max-w-[calc(100vw-2rem)] mr-2 md:mr-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 border-b border-blue-500/30 bg-blue-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                    onError={(e) => {
                      // Fallback to letter avatar if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/20 ${user?.avatar ? 'hidden' : ''}`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-sm text-blue-100 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-white/10 text-white"
              onClick={handleProfileClick}
            >
              <User className="w-4 h-4 mr-3 text-blue-200" />
              <span>Profile (Edit Profile)</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-white/10 text-white"
              onClick={handleSettingsClick}
            >
              <Settings className="w-4 h-4 mr-3 text-blue-200" />
              <span>Settings</span>
            </Button>


            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-white/10 text-white"
              onClick={handlePrivacyPolicyClick}
            >
              <Shield className="w-4 h-4 mr-3 text-blue-200" />
              <span>Privacy Policy</span>
            </Button>

            <div className="border-t border-blue-500/30 my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-left hover:bg-red-500/20 text-red-200 hover:text-red-100"
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
