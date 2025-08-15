import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// CORS and logging middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// ==================== CineStory Early Bird API ====================

// Get current subscriber stats
app.get('/make-server-b27e4aa1/api/early-bird/stats', async (c) => {
  try {
    const stats = await kv.get('early-bird-stats');
    const defaultStats = {
      totalSubscribers: 12847,
      todaySignups: 247,
      lastUpdated: new Date().toISOString(),
      countryStats: {
        'TH': 4521,
        'US': 3204,
        'SG': 1876,
        'JP': 1456,
        'UK': 987,
        'Others': 803
      },
      growthRate: 12.5, // % per day
      targetGoal: 15000
    };
    
    return c.json({
      success: true,
      data: stats || defaultStats
    });
  } catch (error) {
    console.error('Error fetching early bird stats:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch stats'
    }, 500);
  }
});

// Register for early access
app.post('/make-server-b27e4aa1/api/early-bird/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, referrer, source } = body;
    
    if (!email || !email.includes('@')) {
      return c.json({
        success: false,
        error: 'Valid email is required'
      }, 400);
    }

    // Check if email already exists
    const existingUser = await kv.get(`early-bird-user:${email}`);
    if (existingUser) {
      return c.json({
        success: false,
        error: 'Email already registered',
        data: { alreadyRegistered: true }
      });
    }

    // Generate unique subscriber ID
    const subscriberId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // Store user data
    const userData = {
      id: subscriberId,
      email,
      registeredAt: timestamp,
      source: source || 'landing-page',
      referrer: referrer || '',
      ip: c.req.header('cf-connecting-ip') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown'
    };
    
    await kv.set(`early-bird-user:${email}`, userData);
    await kv.set(`early-bird-id:${subscriberId}`, userData);
    
    // Update subscriber count
    const currentStats = await kv.get('early-bird-stats') || {
      totalSubscribers: 12847,
      todaySignups: 247,
      lastUpdated: new Date().toISOString(),
      countryStats: { 'TH': 4521, 'US': 3204, 'SG': 1876, 'JP': 1456, 'UK': 987, 'Others': 803 },
      growthRate: 12.5,
      targetGoal: 15000
    };
    
    // Increment counters
    currentStats.totalSubscribers += 1;
    currentStats.todaySignups += 1;
    currentStats.lastUpdated = timestamp;
    
    // Estimate country based on simple heuristics (basic demo)
    const country = email.includes('.th') || email.includes('@') ? 'TH' : 'Others';
    currentStats.countryStats[country] = (currentStats.countryStats[country] || 0) + 1;
    
    await kv.set('early-bird-stats', currentStats);
    
    // Store in daily signups list
    const today = new Date().toISOString().split('T')[0];
    const dailySignups = await kv.get(`daily-signups:${today}`) || [];
    dailySignups.push({
      subscriberId,
      email,
      timestamp,
      source
    });
    await kv.set(`daily-signups:${today}`, dailySignups);
    
    console.log(`✅ New early bird subscriber: ${email} (ID: ${subscriberId})`);
    
    return c.json({
      success: true,
      data: {
        subscriberId,
        subscriberNumber: currentStats.totalSubscribers,
        message: 'Successfully registered for early access!',
        estimatedLaunch: '2024-03-15',
        benefits: [
          '50% Off Lifetime License',
          'First Access to AI Features',
          'VIP Support & Training',
          'Exclusive Templates & Assets'
        ]
      }
    });
    
  } catch (error) {
    console.error('Error registering early bird user:', error);
    return c.json({
      success: false,
      error: 'Registration failed. Please try again.'
    }, 500);
  }
});

// ==================== EyeMotion Member System ====================

// EyeMotion Member Registration
app.post('/make-server-b27e4aa1/api/eyemotion/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, profession } = body;
    
    if (!email || !password || !name) {
      return c.json({
        success: false,
        error: 'Email, password, and name are required'
      }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`eyemotion-member:${email}`);
    if (existingUser) {
      return c.json({
        success: false,
        error: 'User already exists'
      }, 400);
    }

    // Create user with Supabase Auth
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        profession: profession || 'Creator',
        eyemotion_member: true,
        member_since: new Date().toISOString(),
        subscription_tier: 'beta_access'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return c.json({
        success: false,
        error: 'Failed to create user account'
      }, 500);
    }

    if (!user) {
      return c.json({
        success: false,
        error: 'Failed to create user'
      }, 500);
    }

    // Store additional member data
    const memberData = {
      id: user.id,
      email,
      name,
      profession: profession || 'Creator',
      registeredAt: new Date().toISOString(),
      subscriptionTier: 'beta_access',
      accessLevel: 'member',
      eyemotionFeatures: {
        autocut: true,
        colorGrading: true,
        audioEnhancement: true,
        voiceCommands: false, // premium feature
        collaboration: true,
        cloudRendering: false // premium feature
      },
      usage: {
        projectsCreated: 0,
        minutesProcessed: 0,
        lastActive: new Date().toISOString()
      },
      preferences: {
        language: 'EN',
        theme: 'dark',
        notifications: true
      }
    };

    await kv.set(`eyemotion-member:${email}`, memberData);
    await kv.set(`eyemotion-member-id:${user.id}`, memberData);

    // Update member stats
    const memberStats = await kv.get('eyemotion-member-stats') || {
      totalMembers: 0,
      activeMembers: 0,
      betaMembers: 0,
      premiumMembers: 0
    };
    
    memberStats.totalMembers += 1;
    memberStats.betaMembers += 1;
    await kv.set('eyemotion-member-stats', memberStats);

    console.log(`✅ New EyeMotion member: ${email} (ID: ${user.id})`);

    return c.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: memberData.name,
        profession: memberData.profession,
        subscriptionTier: memberData.subscriptionTier,
        accessLevel: memberData.accessLevel,
        features: memberData.eyemotionFeatures,
        message: 'EyeMotion membership created successfully!'
      }
    });

  } catch (error) {
    console.error('Error creating EyeMotion member:', error);
    return c.json({
      success: false,
      error: 'Registration failed. Please try again.'
    }, 500);
  }
});

// EyeMotion Member Login
app.post('/make-server-b27e4aa1/api/eyemotion/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({
        success: false,
        error: 'Email and password are required'
      }, 400);
    }

    // Authenticate with Supabase
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !session) {
      return c.json({
        success: false,
        error: 'Invalid credentials'
      }, 401);
    }

    // Get member data
    const memberData = await kv.get(`eyemotion-member:${email}`);
    if (!memberData) {
      return c.json({
        success: false,
        error: 'Member not found'
      }, 404);
    }

    // Update last active
    memberData.usage.lastActive = new Date().toISOString();
    await kv.set(`eyemotion-member:${email}`, memberData);

    console.log(`✅ EyeMotion member login: ${email}`);

    return c.json({
      success: true,
      data: {
        accessToken: session.access_token,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: memberData.name,
          profession: memberData.profession,
          subscriptionTier: memberData.subscriptionTier,
          accessLevel: memberData.accessLevel,
          features: memberData.eyemotionFeatures,
          usage: memberData.usage,
          preferences: memberData.preferences
        },
        expiresAt: session.expires_at
      }
    });

  } catch (error) {
    console.error('Error during EyeMotion login:', error);
    return c.json({
      success: false,
      error: 'Login failed. Please try again.'
    }, 500);
  }
});

// Get EyeMotion Member Profile
app.get('/make-server-b27e4aa1/api/eyemotion/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({
        success: false,
        error: 'Authorization token required'
      }, 401);
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({
        success: false,
        error: 'Invalid or expired token'
      }, 401);
    }

    // Get member data
    const memberData = await kv.get(`eyemotion-member:${user.email}`);
    if (!memberData) {
      return c.json({
        success: false,
        error: 'Member profile not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: memberData.name,
        profession: memberData.profession,
        registeredAt: memberData.registeredAt,
        subscriptionTier: memberData.subscriptionTier,
        accessLevel: memberData.accessLevel,
        features: memberData.eyemotionFeatures,
        usage: memberData.usage,
        preferences: memberData.preferences
      }
    });

  } catch (error) {
    console.error('Error fetching EyeMotion profile:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch profile'
    }, 500);
  }
});

// Update EyeMotion Member Profile
app.put('/make-server-b27e4aa1/api/eyemotion/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({
        success: false,
        error: 'Authorization token required'
      }, 401);
    }

    // Verify token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({
        success: false,
        error: 'Invalid or expired token'
      }, 401);
    }

    const body = await c.req.json();
    const { name, profession, preferences } = body;

    // Get current member data
    const memberData = await kv.get(`eyemotion-member:${user.email}`);
    if (!memberData) {
      return c.json({
        success: false,
        error: 'Member not found'
      }, 404);
    }

    // Update member data
    if (name) memberData.name = name;
    if (profession) memberData.profession = profession;
    if (preferences) memberData.preferences = { ...memberData.preferences, ...preferences };
    memberData.usage.lastActive = new Date().toISOString();

    await kv.set(`eyemotion-member:${user.email}`, memberData);
    await kv.set(`eyemotion-member-id:${user.id}`, memberData);

    return c.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
        profile: {
          id: user.id,
          email: user.email,
          name: memberData.name,
          profession: memberData.profession,
          subscriptionTier: memberData.subscriptionTier,
          accessLevel: memberData.accessLevel,
          features: memberData.eyemotionFeatures,
          usage: memberData.usage,
          preferences: memberData.preferences
        }
      }
    });

  } catch (error) {
    console.error('Error updating EyeMotion profile:', error);
    return c.json({
      success: false,
      error: 'Failed to update profile'
    }, 500);
  }
});

// EyeMotion Dashboard Stats
app.get('/make-server-b27e4aa1/api/eyemotion/dashboard', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({
        success: false,
        error: 'Authorization token required'
      }, 401);
    }

    // Verify token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({
        success: false,
        error: 'Invalid or expired token'
      }, 401);
    }

    // Get member data
    const memberData = await kv.get(`eyemotion-member:${user.email}`);
    if (!memberData) {
      return c.json({
        success: false,
        error: 'Member not found'
      }, 404);
      }

    // Get member stats
    const memberStats = await kv.get('eyemotion-member-stats') || {
      totalMembers: 0,
      activeMembers: 0,
      betaMembers: 0,
      premiumMembers: 0
    };

    // Get recent projects (mock data for now)
    const recentProjects = [
      {
        id: 'proj_001',
        name: 'Summer Vacation Edit',
        status: 'completed',
        createdAt: '2024-01-10T10:30:00Z',
        duration: '5:30',
        aiFeatures: ['auto-cut', 'color-grading']
      },
      {
        id: 'proj_002',
        name: 'Product Demo Video',  
        status: 'processing',
        createdAt: '2024-01-12T14:15:00Z',
        duration: '2:45',
        aiFeatures: ['auto-cut', 'audio-enhancement']
      }
    ];

    return c.json({
      success: true,
      data: {
        user: {
          name: memberData.name,
          email: user.email,
          subscriptionTier: memberData.subscriptionTier,
          memberSince: memberData.registeredAt
        },
        usage: memberData.usage,
        features: memberData.eyemotionFeatures,
        recentProjects,
        communityStats: {
          totalMembers: memberStats.totalMembers,
          onlineNow: Math.floor(memberStats.totalMembers * 0.15), // 15% assumed online
          betaMembers: memberStats.betaMembers
        },
        aiStatus: {
          autocut: { status: 'online', queue: 3 },
          colorGrading: { status: 'online', queue: 1 },
          audioEnhancement: { status: 'online', queue: 0 },
          voiceCommands: { status: 'beta', queue: 0 },
          collaboration: { status: 'online', queue: 0 },
          cloudRendering: { status: 'maintenance', queue: 12 }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching EyeMotion dashboard:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch dashboard data'
    }, 500);
  }
});

// Get feature updates
app.get('/make-server-b27e4aa1/api/features/updates', async (c) => {
  try {
    const updates = await kv.get('feature-updates') || [
      {
        id: 'ai-autocut-v2',
        title: 'AI Auto-Cut Engine V2.0',
        description: 'Advanced scene detection with emotion recognition',
        status: 'beta-testing',
        progress: 85,
        eta: '2024-02-15',
        priority: 'high',
        tags: ['AI', 'Auto-Cut', 'Scene Detection']
      },
      {
        id: 'realtime-collab',
        title: 'Real-time Collaboration',
        description: 'Edit videos together with your team in real-time',
        status: 'in-development',
        progress: 60,
        eta: '2024-03-01',
        priority: 'medium',
        tags: ['Collaboration', 'Real-time', 'Team']
      },
      {
        id: 'voice-commands',
        title: 'Voice Command Editing',
        description: 'Control CineStory with natural voice commands',
        status: 'planning',
        progress: 25,
        eta: '2024-04-15',
        priority: 'low',
        tags: ['Voice', 'AI', 'Commands']
      },
      {
        id: 'mobile-app',
        title: 'Mobile Companion App',
        description: 'iOS/Android app for on-the-go editing',
        status: 'in-development',
        progress: 40,
        eta: '2024-03-30',
        priority: 'high',
        tags: ['Mobile', 'iOS', 'Android']
      }
    ];
    
    return c.json({
      success: true,
      data: updates
    });
  } catch (error) {
    console.error('Error fetching feature updates:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch updates'
    }, 500);
  }
});

// Health check
app.get('/make-server-b27e4aa1/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'CineStory EyeMotion API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0
  });
});

// Analytics endpoint
app.get('/make-server-b27e4aa1/api/analytics/summary', async (c) => {
  try {
    const stats = await kv.get('early-bird-stats') || {};
    const memberStats = await kv.get('eyemotion-member-stats') || {};
    const today = new Date().toISOString().split('T')[0];
    const dailySignups = await kv.get(`daily-signups:${today}`) || [];
    
    const analytics = {
      overview: {
        totalSubscribers: stats.totalSubscribers || 0,
        totalMembers: memberStats.totalMembers || 0,
        todaySignups: dailySignups.length,
        growthRate: stats.growthRate || 0,
        conversionRate: 15.7, // mock conversion rate
        targetProgress: ((stats.totalSubscribers || 0) / (stats.targetGoal || 15000)) * 100
      },
      geography: stats.countryStats || {},
      membership: {
        betaMembers: memberStats.betaMembers || 0,
        premiumMembers: memberStats.premiumMembers || 0,
        activeMembers: memberStats.activeMembers || 0
      },
      timeline: {
        thisWeek: dailySignups.length * 7 + Math.floor(Math.random() * 200),
        thisMonth: (stats.totalSubscribers || 0) * 0.3,
        projected: stats.targetGoal || 15000
      }
    };
    
    return c.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch analytics'
    }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found'
  }, 404);
});

// Error handler
app.onError((error, c) => {
  console.error('Server error:', error);
  return c.json({
    success: false,
    error: 'Internal server error'
  }, 500);
});

console.log('🚀 CineStory EyeMotion API Server starting...');

Deno.serve(app.fetch);