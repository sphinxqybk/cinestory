import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { CheckCircle, Clock, Users, Zap, Bot, Sparkles, Play, Star, ArrowRight, Mail, Calendar, TrendingUp, Globe, Monitor, Smartphone, Mic, Palette, Film, Code } from "lucide-react";
import { projectId, publicAnonKey } from './utils/supabase/info';

// -------------------- CineStory Early Bird Landing Page --------------------
function CineStoryEarlyBird() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriberStats, setSubscriberStats] = useState(null);
  const [featureUpdates, setFeatureUpdates] = useState([]);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 34,
    seconds: 56
  });

  // API Base URL
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-b27e4aa1/api`;

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscriber stats
        const statsResponse = await fetch(`${API_BASE}/early-bird/stats`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setSubscriberStats(statsData.data);
          }
        }

        // Fetch feature updates
        const featuresResponse = await fetch(`${API_BASE}/features/updates`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          if (featuresData.success) {
            setFeatureUpdates(featuresData.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to mock data
        setSubscriberStats({
          totalSubscribers: 12847,
          todaySignups: 247,
          growthRate: 12.5,
          targetGoal: 15000
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Feature rotation
  useEffect(() => {
    if (featureUpdates.length > 0) {
      const featureTimer = setInterval(() => {
        setCurrentFeature(prev => (prev + 1) % featureUpdates.length);
      }, 4000);
      return () => clearInterval(featureTimer);
    }
  }, [featureUpdates]);

  const handleEarlyAccess = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/early-bird/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          source: 'landing-page',
          referrer: document.referrer || ''
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSubscribed(true);
        // Update local stats
        if (subscriberStats) {
          setSubscriberStats(prev => ({
            ...prev,
            totalSubscribers: result.data.subscriberNumber
          }));
        }
        console.log('✅ Early access registered:', result.data);
      } else {
        if (result.data?.alreadyRegistered) {
          alert('✉️ This email is already registered for early access!');
        } else {
          alert(`❌ Registration failed: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to register:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoading, subscriberStats]);

  const coreFeatures = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Auto-Cut Revolution",
      description: "Smart scene detection, emotion recognition, and automatic cutting that understands your story",
      status: "🔥 Beta Testing",
      highlight: "95% accuracy in scene detection"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Intelligent Color Grading",
      description: "Professional-grade color correction powered by machine learning from Hollywood films",
      status: "✨ In Development",
      highlight: "Trained on 10,000+ film scenes"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "One-Click Audio Magic",
      description: "Automatic noise reduction, voice enhancement, and perfect audio mixing",
      status: "⚡ Ready Soon",
      highlight: "Studio-quality in seconds"
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description: "Edit together with your team in real-time, anywhere in the world",
      status: "🌐 Coming Q2",
      highlight: "Live sync technology"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Companion App",
      description: "Continue editing on iOS/Android with full feature parity"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Command Control",
      description: "Edit videos using natural voice commands"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "AI Style Transfer",
      description: "Apply cinematic styles from famous films instantly"
    },
    {
      icon: <Film className="w-6 h-6" />,
      title: "8K Export Support",
      description: "Export in 8K, HDR, and all professional formats"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Plugin Ecosystem",
      description: "Extend functionality with custom AI plugins"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Cloud Rendering",
      description: "Lightning-fast cloud-based video processing"
    }
  ];

  const earlyBirdBenefits = [
    "🎯 50% Off Lifetime License - Save $500",
    "🚀 First Access to All AI Features", 
    "👑 VIP Support & Personal Training",
    "🎁 Exclusive Templates & Assets Library",
    "💎 Premium AI Models Access",
    "🔥 No Monthly Subscription - Ever",
    "🏆 Early Bird Certificate & Badge",
    "📞 Direct Line to Development Team"
  ];

  const testimonials = [
    {
      name: "สมชาย ผกาพันธ์",
      role: "Film Director, Bangkok",
      content: "ระบบ AI ของ CineStory จะเปลี่ยนวงการภาพยนตร์ไทยให้ก้าวหน้าขึ้นไปอีกระดับ รอไม่ไหวแล้ว!",
      rating: 5,
      avatar: "🎬"
    },
    {
      name: "Sarah Chen",
      role: "YouTube Creator, 2.4M Subscribers",
      content: "Finally! Professional AI editing that actually understands storytelling. This will save me 10+ hours per video.",
      rating: 5,
      avatar: "📹"
    },
    {
      name: "มานะ ฟิล์มเมกเกอร์",
      role: "Indie Filmmaker, Thailand",
      content: "อนาคตของการตัดต่อมาถึงแล้ว! ขอเป็นคนแรกที่ได้ใช้ AI auto-cut ที่ทำงานได้จริง",
      rating: 5,
      avatar: "🎭"
    },
    {
      name: "Alex Rodriguez",
      role: "Post-Production Studio Owner",
      content: "We've tested the alpha version. The AI color grading is absolutely mind-blowing - it's like having a colorist genius built-in.",
      rating: 5,
      avatar: "🎨"
    }
  ];

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Welcome to the Future!
            </h2>
            
            <p className="text-gray-600 mb-6 text-lg">
              You're now part of the CineStory Early Bird community. 
              We've sent exclusive updates and benefits to your email.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <p className="text-sm text-blue-800 mb-2">
                <strong>🏆 Early Bird #{subscriberStats?.totalSubscribers?.toLocaleString() || 'XXXX'}</strong>
              </p>
              <p className="text-blue-700">
                You'll receive launch notifications, beta access invitations, 
                and exclusive behind-the-scenes updates as we build the future of video editing.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.open('https://cinestoryai.com/facebook', '_blank')}
                variant="outline" 
                className="w-full hover:bg-blue-50"
              >
                📱 Follow Progress on Facebook
              </Button>
              
              <Button 
                onClick={() => window.open('https://discord.gg/cinestoryai', '_blank')}
                variant="outline" 
                className="w-full hover:bg-purple-50"
              >
                💬 Join Discord Community
              </Button>
              
              <Button 
                onClick={() => window.open('https://twitter.com/cinestoryai', '_blank')}
                variant="outline" 
                className="w-full hover:bg-blue-50"
              >
                🐦 Get Updates on Twitter
              </Button>
              
              <Button 
                onClick={() => window.open('https://cinestoryai.com/blog', '_blank')}
                variant="outline" 
                className="w-full hover:bg-green-50"
              >
                📰 Read Development Blog
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              🔒 Your data is secure. Visit <strong>cinestoryai.com</strong> for updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-studio-black-deepest">
      {/* Hero Section with Studio Black Theme */}
      <div className="relative overflow-hidden pt-8 pb-16 bg-studio-gradient-deep">
        {/* Animated Background with Studio Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-studio-black-medium/20 to-studio-black-light/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cinestory-blue/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cinestory-magenta/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cinestory-cyan/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Header with Studio Black Styling */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-studio-gradient-surface rounded-xl flex items-center justify-center shadow-studio-depth-2 border border-light-stroke-primary/20">
                <span className="text-light-glow-highlight font-bold text-xl">🎬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-light-stroke animate-light-stroke">CineStory</h1>
                <p className="text-light-glow-accent">Professional AI Video Editor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-cinestory-nebula-1/20 text-light-stroke-highlight border-light-stroke-highlight/30 px-4 py-2 shadow-studio-depth-1">
                <Clock className="w-4 h-4 mr-2" />
                Early Bird Live
              </Badge>
              
              {subscriberStats && (
                <div className="flex items-center space-x-2 bg-studio-black-surface/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-light-stroke-accent/20 shadow-studio-depth-1">
                  <TrendingUp className="w-4 h-4 text-cinestory-teal" />
                  <span className="text-light-glow font-semibold">
                    {subscriberStats.totalSubscribers?.toLocaleString()} joined
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Hero Content with Light Stroke Typography */}
          <div className="text-center mb-24">
            <div className="inline-flex items-center space-x-3 bg-studio-black-surface/30 backdrop-blur-sm rounded-full px-8 py-4 mb-12 border border-light-stroke-accent/20 shadow-studio-depth-1">
              <Bot className="w-6 h-6 text-cinestory-blue animate-pulse" />
              <span className="text-light-glow-accent font-semibold text-lg">Powered by Advanced AI</span>
              <Sparkles className="w-5 h-5 text-light-stroke-highlight animate-pulse" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-light-stroke-highlight mb-8 leading-tight animate-light-stroke">
              The Future of
              <span className="text-light-stroke-accent"> Video Editing</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-light-glow mb-12 max-w-4xl mx-auto leading-relaxed">
              Professional AI-powered video editing that thinks, learns, and creates alongside you. 
              <span className="text-light-glow-accent font-semibold"> Join the revolution.</span>
            </p>

            {/* Stats Display with Studio Black Cards */}
            {subscriberStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-3xl mx-auto">
                <div className="card-studio-depth p-4 transition-smooth hover-lift">
                  <div className="text-2xl font-bold text-light-stroke-highlight">
                    {subscriberStats.totalSubscribers?.toLocaleString()}
                  </div>
                  <div className="text-light-glow-accent text-sm">Early Birds</div>
                </div>
                <div className="card-studio-depth p-4 transition-smooth hover-lift">
                  <div className="text-2xl font-bold text-cinestory-teal">
                    +{subscriberStats.todaySignups || 0}
                  </div>
                  <div className="text-light-glow-accent text-sm">Today</div>
                </div>
                <div className="card-studio-depth p-4 transition-smooth hover-lift">
                  <div className="text-2xl font-bold text-light-stroke-highlight">
                    {subscriberStats.growthRate || 0}%
                  </div>
                  <div className="text-light-glow-accent text-sm">Growth Rate</div>
                </div>
                <div className="card-studio-depth p-4 transition-smooth hover-lift">
                  <div className="text-2xl font-bold text-cinestory-magenta">
                    {Math.round(((subscriberStats.totalSubscribers || 0) / (subscriberStats.targetGoal || 15000)) * 100)}%
                  </div>
                  <div className="text-cinestory-cyan text-sm">to Launch</div>
                </div>
              </div>
            )}

            {/* Countdown Timer with Studio Effects */}
            <div className="panel-studio-depth p-8 mb-16 max-w-3xl mx-auto border border-light-stroke-primary/20 rounded-3xl animate-dimensional-glow">
              <p className="text-light-stroke-accent font-semibold mb-6 text-xl animate-light-stroke">🚀 Launch Countdown</p>
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="card-studio-depth p-6 mb-3 transition-smooth hover-lift">
                      <span className="text-3xl md:text-4xl font-bold text-light-stroke-highlight animate-light-stroke">
                        {item.value.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-light-glow font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Early Bird Form with Studio Styling */}
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleEarlyAccess} className="space-y-6">
                <div className="flex space-x-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flex-1 bg-studio-black-surface/50 border-light-stroke-accent/30 text-light-glow placeholder-light-glow/50 focus:bg-studio-black-light/50 focus:border-light-stroke-accent h-14 text-lg rounded-xl shadow-studio-depth-1"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isLoading}
                    className="btn-studio-light px-10 h-14 rounded-xl font-semibold transition-smooth hover-lift"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-light-stroke-primary"></div>
                    ) : (
                      <>
                        <span className="text-light-glow-highlight">Join Now</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
              
              <p className="text-light-glow mt-4 text-lg">
                🎁 <strong className="text-light-stroke-accent animate-light-stroke">{subscriberStats?.totalSubscribers?.toLocaleString() || '12,000+'}</strong> creators already joined the revolution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Showcase with Studio Black Theme */}
      <div className="bg-studio-black-medium/50 backdrop-blur-sm border-t border-light-stroke-primary/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-light-stroke-highlight mb-4 animate-light-stroke">
              🤖 AI-Powered Features
            </h2>
            <p className="text-light-glow text-lg">
              Revolutionary tools that will change how you edit forever
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, index) => (
              <Card 
                key={index}
                className={`card-studio-depth transition-all duration-500 hover-lift ${
                  currentFeature === index ? 'border-light-stroke-accent shadow-studio-depth-3' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-cinestory-blue/20 rounded-lg flex items-center justify-center text-cinestory-blue shadow-studio-depth-1">
                      {feature.icon}
                    </div>
                    <Badge variant="outline" className="text-xs border-light-stroke-accent/30 text-light-glow-accent bg-studio-black-surface/50">
                      {feature.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-light-stroke mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-light-glow text-sm">
                    {feature.description}
                  </p>
                  {feature.highlight && (
                    <p className="text-light-stroke-accent text-xs mt-2 animate-light-stroke">
                      ✨ {feature.highlight}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Features Showcase with Studio Black */}
      <div className="py-20 bg-studio-gradient-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-light-stroke-highlight mb-6 animate-light-stroke">
              🚀 Complete Feature Suite
            </h2>
            <p className="text-xl text-light-glow max-w-3xl mx-auto">
              Everything you need for professional video editing, powered by cutting-edge AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <div 
                key={index}
                className="card-studio-depth p-6 transition-smooth hover-lift"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-studio-gradient-depth rounded-xl flex items-center justify-center text-light-stroke-accent shadow-studio-depth-2">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-light-stroke">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-light-glow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Early Bird Benefits with Studio Black */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="panel-studio-depth p-8 md:p-12 border border-light-stroke-highlight/20 rounded-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-cinestory-nebula-1/20 rounded-full px-6 py-3 mb-6 border border-light-stroke-highlight/30 shadow-studio-depth-1">
              <Star className="w-5 h-5 text-light-stroke-highlight animate-pulse" />
              <span className="text-light-stroke-highlight font-semibold animate-light-stroke">Early Bird Special</span>
              <Star className="w-5 h-5 text-light-stroke-highlight animate-pulse" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-light-stroke-highlight mb-4 animate-light-stroke">
              Exclusive Benefits for Early Supporters
            </h2>
            <p className="text-light-glow text-lg">
              Limited time offer - Only for the first 15,000 subscribers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {earlyBirdBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 bg-studio-black-surface/50 rounded-lg p-4 border border-light-stroke-accent/20 shadow-studio-depth-1 hover-lift transition-smooth">
                <CheckCircle className="w-5 h-5 text-cinestory-teal flex-shrink-0" />
                <span className="text-light-glow font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="card-studio-depth p-6 mb-8 max-w-sm mx-auto">
              <p className="text-light-glow-accent text-sm mb-2">Early Bird Progress</p>
              <Progress value={(subscriberStats?.totalSubscribers || 0) / (subscriberStats?.targetGoal || 15000) * 100} className="mb-2" />
              <p className="text-light-stroke font-semibold">
                {subscriberStats?.totalSubscribers?.toLocaleString()} / 15,000 spots filled
              </p>
            </div>
            
            <p className="text-light-stroke-highlight font-medium animate-light-stroke">
              ⚡ Only {(15000 - (subscriberStats?.totalSubscribers || 0)).toLocaleString()} spots remaining!
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof with Studio Black */}
      <div className="bg-studio-black-medium/50 backdrop-blur-sm border-t border-light-stroke-primary/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-light-stroke-highlight mb-4 animate-light-stroke">
              💬 What Creators Are Saying
            </h2>
            <p className="text-light-glow">
              Join thousands of excited creators waiting for CineStory
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-studio-depth transition-smooth hover-lift">
                <CardContent className="p-6">
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-light-stroke-highlight fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-light-glow mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div>
                    <p className="text-light-stroke font-semibold">{testimonial.name}</p>
                    <p className="text-light-glow-accent text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA with Studio Black */}
      <div className="bg-studio-gradient-deep border-t border-light-stroke-primary/20">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-light-stroke-highlight mb-4 animate-light-stroke">
            Don't Miss the AI Revolution
          </h2>
          <p className="text-light-glow text-lg mb-8">
            Be among the first to experience the future of video editing
          </p>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleEarlyAccess} className="space-y-4">
              <div className="flex space-x-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-studio-black-surface border-light-stroke-accent/30 text-light-glow placeholder-light-glow/50 focus:border-light-stroke-accent shadow-studio-depth-1"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  className="btn-studio-light font-semibold px-8 transition-smooth hover-lift"
                >
                  <span className="text-light-glow-highlight">Join Early Bird</span>
                </Button>
              </div>
            </form>
            
            <p className="text-light-glow text-sm mt-4">
              🔒 No spam, unsubscribe anytime. Early access guaranteed.
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Studio Black */}
      <div className="bg-studio-black-deepest border-t border-light-stroke-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-studio-gradient-surface rounded-lg flex items-center justify-center shadow-studio-depth-1 border border-light-stroke-primary/20">
                <span className="text-light-glow-highlight font-bold">🎬</span>
              </div>
              <div>
                <p className="text-light-stroke font-semibold">CineStory</p>
                <p className="text-light-glow-accent text-sm">© 2024 - Coming Soon</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="text-light-glow hover:text-light-stroke-accent transition-colors">
                📧 Contact
              </button>
              <button className="text-light-glow hover:text-light-stroke-accent transition-colors">
                📱 Follow Updates
              </button>
              <button className="text-light-glow hover:text-light-stroke-accent transition-colors">
                💬 Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Main App Component --------------------
export default function App() {
  return <CineStoryEarlyBird />;
}