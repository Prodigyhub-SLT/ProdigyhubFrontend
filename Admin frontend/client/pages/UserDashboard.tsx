import { useState } from 'react';
// Assuming hooks and UI components are available from these paths
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
    User,
    Shield,
    Building,
    Calendar,
    Camera,
    Save,
    Lock,
    Eye,
    EyeOff,
    Trash2,
    Download,
    History,
    Activity,
    Search,
    Mail
} from 'lucide-react';

// Mock data and hooks for standalone demonstration
const useToast = () => ({ toast: (options) => console.log('Toast:', options) });
const useAuth = () => ({
    user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Customer Solutions',
        role: 'admin',
        lastLogin: '2025-09-18T14:30:00Z',
        avatar: 'https://github.com/shadcn.png'
    },
    updateUser: (data) => console.log('Updating user:', data)
});


export default function UserProfilePage() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        department: user?.department || '',
        bio: 'Senior Customer Solutions Manager with over 10 years of experience in the telecommunications industry.',
        phone: '+94 77 123 4567',
        location: 'Colombo, Sri Lanka',
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileSave = () => {
        updateUser({
            name: profileData.name,
            email: profileData.email,
            department: profileData.department
        });
        setIsEditing(false);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
        });
    };

    const handlePasswordChange = () => {
        if (securityData.newPassword !== securityData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "New password and confirmation do not match.",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleAvatarChange = () => {
        toast({
            title: "Avatar Updated",
            description: "Your profile picture has been changed.",
        });
    };

    const mockActivityLog = [
        { action: 'Logged In', timestamp: '2025-09-19 10:30:00', ip: '192.168.1.100' },
        { action: 'Profile Information Updated', timestamp: '2025-09-18 16:45:00', ip: '192.168.1.100' },
        { action: 'Password Changed', timestamp: '2025-09-15 09:15:00', ip: '203.0.113.25' },
        { action: 'Data Export Requested', timestamp: '2025-09-14 11:20:00', ip: '192.168.1.100' },
        { action: 'Logged In', timestamp: '2025-09-15 09:14:00', ip: '203.0.113.25' },
    ];

    const roleColors = {
        admin: 'bg-red-100 text-red-800 border-red-200',
        user: 'bg-blue-100 text-blue-800 border-blue-200',
        viewer: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const profileTabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'activity', label: 'Activity', icon: History },
        { id: 'data', label: 'Data Export', icon: Download },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">SLT</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">SLTMOBITEL</h1>
                                <p className="text-xs text-gray-500">The Connection</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="bg-gray-100 border-0 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                />
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub Navigation */}
            <nav className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-0">
                        {profileTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                 <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account settings, profile, and preferences</p>
                </div>
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="text-2xl font-bold">
                                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={handleAvatarChange}>
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">{user?.name}</h3>
                                <p className="text-gray-600 flex items-center gap-2"><Mail className="h-4 w-4" />{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={`${roleColors[user?.role || 'viewer']} font-medium`}>
                                        {user?.role?.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="font-medium">
                                        <Building className="h-3 w-3 mr-1.5" />
                                        {user?.department}
                                    </Badge>
                                </div>
                            </div>
                            <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                        </div>
                        <Separator className="my-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={!isEditing} /></div>
                            <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditing} /></div>
                            <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" value={profileData.department} onChange={(e) => setProfileData({...profileData, department: e.target.value})} disabled={!isEditing} /></div>
                            <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditing} /></div>
                            <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={profileData.location} onChange={(e) => setProfileData({...profileData, location: e.target.value})} disabled={!isEditing} /></div>
                        </div>
                        <div className="mt-6 space-y-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} disabled={!isEditing} rows={4} /></div>
                        {isEditing && (
                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleProfileSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                     <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input id="currentPassword" type={showPassword ? "text" : "password"} value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} />
                                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} /></div>
                                <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type="password" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} /></div>
                                <Button onClick={handlePasswordChange} className="w-full">Update Password</Button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                    <div><p className="font-medium">Last Login</p><p className="text-sm text-gray-600">{new Date(user.lastLogin).toLocaleString()}</p></div>
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                    <div><p className="font-medium">Account Status</p><p className="text-sm text-green-600 font-semibold">Active</p></div>
                                    <Shield className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                 {/* Activity Tab */}
                {activeTab === 'activity' && (
                     <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Activity</h3>
                        <div className="space-y-3">
                            {mockActivityLog.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <Activity className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">{activity.action}</p>
                                            <p className="text-sm text-gray-600">IP Address: {activity.ip}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Data Export Tab */}
                {activeTab === 'data' && (
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export & Management</h3>
                        <div className="space-y-6">
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <h4 className="font-medium mb-2">Export Account Data</h4>
                                <p className="text-sm text-gray-600 mb-4">Download a copy of all your account data including profile information, activity logs, and preferences.</p>
                                <Button variant="outline"><Download className="h-4 w-4 mr-2" />Download Data (JSON)</Button>
                            </div>
                            <div className="p-4 border rounded-lg border-red-200 bg-red-50">
                                <h4 className="font-medium mb-2 text-red-800">Danger Zone</h4>
                                <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Delete Account</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete Account</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
