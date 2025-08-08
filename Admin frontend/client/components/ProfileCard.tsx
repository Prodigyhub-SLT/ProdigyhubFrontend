import { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Mail, 
  Building, 
  Calendar, 
  MapPin, 
  Globe,
  Phone,
  Edit
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
  department?: string;
  lastLogin?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
}

interface ProfileCardProps {
  user: User;
  showActions?: boolean;
  onEdit?: () => void;
  children?: ReactNode;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function ProfileCard({ 
  user, 
  showActions = false, 
  onEdit, 
  children,
  variant = 'default'
}: ProfileCardProps) {
  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    user: 'bg-blue-100 text-blue-800 border-blue-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    return new Date(lastLogin).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (variant === 'compact') {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                <Badge variant="outline" className={`text-xs ${roleColors[user.role]}`}>
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
              {user.department && (
                <p className="text-xs text-gray-500 truncate">{user.department}</p>
              )}
            </div>
            {showActions && onEdit && (
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          {children}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <Badge className={roleColors[user.role]}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.department && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Building className="h-4 w-4" />
                    <span className="text-sm">{user.department}</span>
                  </div>
                )}
              </div>
            </div>
            {showActions && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Bio</h4>
              <p className="text-sm text-gray-600">{user.bio}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{user.phone}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {user.lastLogin && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Last active: {formatLastLogin(user.lastLogin)}
                </span>
              </div>
            )}
          </div>
          {children}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <Badge variant="outline" className={roleColors[user.role]}>
                  {user.role}
                </Badge>
              </div>
              <p className="text-gray-600">{user.email}</p>
              {user.department && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Building className="h-3 w-3" />
                  <span className="text-sm">{user.department}</span>
                </div>
              )}
              {user.lastLogin && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">Last login: {formatLastLogin(user.lastLogin)}</span>
                </div>
              )}
            </div>
          </div>
          {showActions && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
