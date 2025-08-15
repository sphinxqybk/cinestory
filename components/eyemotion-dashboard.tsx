import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Settings, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Zap, 
  Bot, 
  Sparkles, 
  Monitor, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Wrench,
  Eye,
  Film,
  Palette,
  Volume2,
  CloudUpload,
  UserCircle,
  LogOut,
  Home,
  PlusCircle,
  Search
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EyeMotionDashboardProps {
  user?: {
    id: string;
    email: string;
    name: string;
    profession: string;
    subscriptionTier: string;
    accessLevel: string;
    features: {
      autocut: boolean;
      colorGrading: boolean;
      audioEnhancement: boolean;
      voiceCommands: boolean;
      collaboration: boolean;
      cloudRendering: boolean;
    };
    usage: {
      projectsCreated: number;
      minutesProcessed: number;
      lastActive: string;
    };
    preferences: {
      language: string;
      theme: string;
      notifications: boolean;
    };
  };
  accessToken?: string;
  onLogout?: () => void;
}

export default function EyeMotionDashboard({ user, accessToken, onLogout }: EyeMotionDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-b27e4aa1/api`;

  useEffect(() => {
    if (user && accessToken) {
      fetchDashboardData();
    }
  }, [user, accessToken]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/eyemotion/dashboard`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Please log in to access EyeMotion Dashboard
          </h2>
          <Button onClick={onLogout}>Back to Login</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'beta': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'beta': return <Sparkles className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">EyeMotion Studio</h1>
                  <p className="text-sm text-gray-500">AI-Powered Video Editing</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>New Project</span>
                </Button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <UserCircle className="w-5 h-5 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-500">{user.subscriptionTier}</div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to create amazing videos with AI-powered editing?
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Projects Created</p>
                      <p className="text-2xl font-bold text-gray-900">{user.usage.projectsCreated}</p>
                    </div>
                    <Film className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Minutes Processed</p>
                      <p className="text-2xl font-bold text-gray-900">{user.usage.minutesProcessed}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Community</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData?.communityStats?.totalMembers || 0}
                      </p>
                      <p className="text-xs text-gray-500">members</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Subscription</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{user.subscriptionTier.replace('_', ' ')}</p>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Features Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>AI Features Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData?.aiStatus && Object.entries(dashboardData.aiStatus).map(([feature, status]: [string, any]) => (
                    <div key={feature} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {feature === 'autocut' && <Bot className="w-4 h-4 text-blue-600" />}
                          {feature === 'colorGrading' && <Palette className="w-4 h-4 text-blue-600" />}
                          {feature === 'audioEnhancement' && <Volume2 className="w-4 h-4 text-blue-600" />}
                          {feature === 'voiceCommands' && <Sparkles className="w-4 h-4 text-blue-600" />}
                          {feature === 'collaboration' && <Users className="w-4 h-4 text-blue-600" />}
                          {feature === 'cloudRendering' && <CloudUpload className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-gray-500">Queue: {status.queue}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(status.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(status.status)}
                          <span className="capitalize">{status.status}</span>
                        </div>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentProjects?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentProjects.map((project: any) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Film className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{project.name}</p>
                            <p className="text-sm text-gray-500">
                              {project.duration} • {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {project.aiFeatures.map((feature: string) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <Badge className={project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No projects yet. Create your first video!</p>
                    <Button className="mt-4">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create New Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-6">Start creating amazing videos with AI assistance</p>
                  <Button size="lg">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai-tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className={user.features.autocut ? '' : 'opacity-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>AI Auto-Cut</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatically detect scenes and create cuts based on content analysis
                  </p>
                  <Button disabled={!user.features.autocut} className="w-full">
                    {user.features.autocut ? 'Launch Tool' : 'Upgrade Required'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={user.features.colorGrading ? '' : 'opacity-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Color Grading</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    AI-powered color correction and professional grading
                  </p>
                  <Button disabled={!user.features.colorGrading} className="w-full">
                    {user.features.colorGrading ? 'Launch Tool' : 'Upgrade Required'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={user.features.audioEnhancement ? '' : 'opacity-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Volume2 className="w-5 h-5" />
                    <span>Audio Enhancement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatic noise reduction and audio quality improvement
                  </p>
                  <Button disabled={!user.features.audioEnhancement} className="w-full">
                    {user.features.audioEnhancement ? 'Launch Tool' : 'Upgrade Required'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={user.features.voiceCommands ? '' : 'opacity-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Voice Commands</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Control editing with natural voice commands
                  </p>
                  <Button disabled={!user.features.voiceCommands} className="w-full">
                    {user.features.voiceCommands ? 'Launch Tool' : 'Premium Feature'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={user.features.collaboration ? '' : 'opacity-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Collaboration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Real-time collaborative editing with team members
                  </p>
                  <Button disabled={!user.features.collaboration} className="w-full">
                    {user.features.collaboration ? 'Launch Tool' : 'Upgrade Required'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={user.features.cloudRendering ? '' : 'opacity-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CloudUpload className="w-5 h-5" />
                    <span>Cloud Rendering</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    High-speed cloud-based video rendering and processing
                  </p>
                  <Button disabled={!user.features.cloudRendering} className="w-full">
                    {user.features.cloudRendering ? 'Launch Tool' : 'Premium Feature'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <Input defaultValue={user.name} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input defaultValue={user.email} disabled className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Profession</label>
                    <Input defaultValue={user.profession} className="mt-1" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Language</label>
                    <select className="mt-1 w-full rounded-md border border-gray-300 p-2">
                      <option value="EN" selected={user.preferences.language === 'EN'}>English</option>
                      <option value="TH" selected={user.preferences.language === 'TH'}>ไทย</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Theme</label>
                    <select className="mt-1 w-full rounded-md border border-gray-300 p-2">
                      <option value="dark" selected={user.preferences.theme === 'dark'}>Dark</option>
                      <option value="light" selected={user.preferences.theme === 'light'}>Light</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="notifications" 
                      defaultChecked={user.preferences.notifications}
                    />
                    <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                  </div>
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}