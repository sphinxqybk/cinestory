import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Mail, Lock, User, Briefcase, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EyeMotionAuthProps {
  onLoginSuccess: (user: any, accessToken: string) => void;
}

export default function EyeMotionAuth({ onLoginSuccess }: EyeMotionAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    profession: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-b27e4aa1/api`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const endpoint = isLogin ? '/eyemotion/login' : '/eyemotion/register';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        if (isLogin) {
          // Login successful
          onLoginSuccess(result.data.user, result.data.accessToken);
        } else {
          // Registration successful, switch to login
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: '' }));
          alert('✅ Registration successful! Please log in with your credentials.');
        }
      } else {
        // Handle error
        if (result.error.includes('already exists') || result.error.includes('already registered')) {
          setErrors({ email: 'This email is already registered. Try logging in instead.' });
        } else if (result.error.includes('Invalid credentials')) {
          setErrors({ password: 'Invalid email or password' });
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const betaFeatures = [
    { icon: <Eye className="w-5 h-5" />, name: 'AI Auto-Cut', description: '95% accuracy scene detection' },
    { icon: <Sparkles className="w-5 h-5" />, name: 'Color Grading', description: 'Hollywood-grade AI correction' },
    { icon: <CheckCircle className="w-5 h-5" />, name: 'Audio Enhancement', description: 'Studio-quality processing' },
    { icon: <ArrowRight className="w-5 h-5" />, name: 'Real-time Collaboration', description: 'Edit with your team' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="text-white space-y-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">EyeMotion Studio</h1>
                <p className="text-purple-200">Professional AI Video Editing</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-4">
              The Future of Video Editing is Here
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of creators using AI-powered tools to create stunning videos in minutes, not hours.
            </p>
          </div>

          {/* Beta Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta Access
              </Badge>
              <span className="text-purple-200">Early access to all features</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {betaFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-300">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{feature.name}</p>
                    <p className="text-sm text-purple-200">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2,400+</div>
              <div className="text-sm text-purple-200">Beta Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">150K+</div>
              <div className="text-sm text-purple-200">Videos Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-sm text-purple-200">Time Saved</div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome Back' : 'Join EyeMotion'}
              </CardTitle>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Sign in to your EyeMotion account' 
                  : 'Create your account and start editing'
                }
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {errors.general}
                  </div>
                )}

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profession (Optional)
                      </label>
                      <div className="relative">
                        <Briefcase className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <Input
                          type="text"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          placeholder="e.g., Video Creator, Filmmaker"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={isLogin ? "Enter your password" : "Create a password (min 6 chars)"}
                      className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {!isLogin && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Beta Access Includes:</p>
                        <ul className="text-sm space-y-1">
                          <li>• All AI editing features</li>
                          <li>• Unlimited projects</li>
                          <li>• Priority support</li>
                          <li>• Early access to new features</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setFormData(prev => ({ ...prev, password: '' }));
                    }}
                    className="ml-1 text-purple-600 hover:text-purple-700 font-semibold"
                    disabled={isLoading}
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  By {isLogin ? 'signing in' : 'creating an account'}, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}