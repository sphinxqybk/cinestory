// -------------------- Production-Ready Environment Configuration --------------------
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'staging';
  API_BASE_URL: string;
  WS_BASE_URL: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  
  // CineStory specific endpoints
  CINESTORY_API_URL: string;
  CINESTORY_WS_URL: string;
  AUTOMATION_API_URL: string;
  
  // Feature flags
  features: {
    realTimeUpdates: boolean;
    analytics: boolean;
    automation: boolean;
    ecosystem: boolean;
    debugging: boolean;
  };
  
  // Performance settings
  performance: {
    dataRefreshIntervals: {
      system: number;
      tools: number;
      workflows: number;
      ecosystem: number;
      automation: number;
    };
    caching: {
      enabled: boolean;
      ttl: number;
    };
    retryAttempts: number;
    timeout: number;
  };
  
  // Security settings
  security: {
    apiKey: string;
    sessionTimeout: number;
    encryptData: boolean;
  };
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side environment variables (prefixed with VITE_ or REACT_APP_)
    return (window as any).__ENV__?.[key] || fallback;
  }
  // Server-side or build-time environment variables
  return process.env[key] || fallback;
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  NODE_ENV: 'production',
  API_BASE_URL: getEnvVar('CINESTORY_API_URL', 'https://api.cinestory.app'),
  WS_BASE_URL: getEnvVar('CINESTORY_WS_URL', 'wss://ws.cinestory.app'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  
  CINESTORY_API_URL: getEnvVar('CINESTORY_API_URL', 'https://api.cinestory.app/v1'),
  CINESTORY_WS_URL: getEnvVar('CINESTORY_WS_URL', 'wss://ws.cinestory.app/v1'),
  AUTOMATION_API_URL: getEnvVar('AUTOMATION_API_URL', 'https://automation.cinestory.app/v1'),
  
  features: {
    realTimeUpdates: true,
    analytics: true,
    automation: true,
    ecosystem: true,
    debugging: false,
  },
  
  performance: {
    dataRefreshIntervals: {
      system: 5000,      // 5 seconds
      tools: 10000,      // 10 seconds  
      workflows: 3000,   // 3 seconds
      ecosystem: 15000,  // 15 seconds
      automation: 2000,  // 2 seconds
    },
    caching: {
      enabled: true,
      ttl: 300000, // 5 minutes
    },
    retryAttempts: 3,
    timeout: 30000, // 30 seconds
  },
  
  security: {
    apiKey: getEnvVar('CINESTORY_API_KEY', ''),
    sessionTimeout: 3600000, // 1 hour
    encryptData: true,
  },
};

// Staging configuration
const stagingConfig: EnvironmentConfig = {
  ...productionConfig,
  NODE_ENV: 'staging',
  API_BASE_URL: getEnvVar('CINESTORY_STAGING_API_URL', 'https://staging-api.cinestory.app'),
  WS_BASE_URL: getEnvVar('CINESTORY_STAGING_WS_URL', 'wss://staging-ws.cinestory.app'),
  CINESTORY_API_URL: getEnvVar('CINESTORY_STAGING_API_URL', 'https://staging-api.cinestory.app/v1'),
  CINESTORY_WS_URL: getEnvVar('CINESTORY_STAGING_WS_URL', 'wss://staging-ws.cinestory.app/v1'),
  AUTOMATION_API_URL: getEnvVar('AUTOMATION_STAGING_API_URL', 'https://staging-automation.cinestory.app/v1'),
  
  features: {
    ...productionConfig.features,
    debugging: true,
  },
  
  security: {
    ...productionConfig.security,
    apiKey: getEnvVar('CINESTORY_STAGING_API_KEY', ''),
    encryptData: false, // Easier debugging in staging
  },
};

// Development configuration (with mock endpoints)
const developmentConfig: EnvironmentConfig = {
  NODE_ENV: 'development',
  API_BASE_URL: getEnvVar('CINESTORY_DEV_API_URL', 'http://localhost:3001'),
  WS_BASE_URL: getEnvVar('CINESTORY_DEV_WS_URL', 'ws://localhost:3001'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  
  CINESTORY_API_URL: getEnvVar('CINESTORY_DEV_API_URL', 'http://localhost:3001/v1'),
  CINESTORY_WS_URL: getEnvVar('CINESTORY_DEV_WS_URL', 'ws://localhost:3001/v1'),
  AUTOMATION_API_URL: getEnvVar('AUTOMATION_DEV_API_URL', 'http://localhost:3002/v1'),
  
  features: {
    realTimeUpdates: true,
    analytics: false,
    automation: true,
    ecosystem: true,
    debugging: true,
  },
  
  performance: {
    dataRefreshIntervals: {
      system: 10000,     // Slower in dev
      tools: 15000,      
      workflows: 5000,   
      ecosystem: 20000,  
      automation: 3000,  
    },
    caching: {
      enabled: false, // Disable caching in dev
      ttl: 60000,
    },
    retryAttempts: 1,
    timeout: 10000,
  },
  
  security: {
    apiKey: getEnvVar('CINESTORY_DEV_API_KEY', 'dev-key-12345'),
    sessionTimeout: 86400000, // 24 hours in dev
    encryptData: false,
  },
};

// Get current environment
const getCurrentEnvironment = (): 'development' | 'production' | 'staging' => {
  const env = getEnvVar('NODE_ENV', 'development');
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
};

// Main configuration getter
export const getConfig = (): EnvironmentConfig => {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    default:
      return developmentConfig;
  }
};

// Environment helpers
export const isDevelopment = (): boolean => getCurrentEnvironment() === 'development';
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';
export const isStaging = (): boolean => getCurrentEnvironment() === 'staging';

// Health check function
export const checkEnvironmentHealth = async (): Promise<{
  api: boolean;
  websocket: boolean;
  features: Record<string, boolean>;
  performance: Record<string, number>;
}> => {
  const config = getConfig();
  
  // Check API health
  let apiHealth = false;
  try {
    const response = await fetch(`${config.API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.security.apiKey}`,
      },
      timeout: config.performance.timeout,
    });
    apiHealth = response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
  }
  
  // Check WebSocket health (basic connectivity test)
  let wsHealth = false;
  try {
    const ws = new WebSocket(config.WS_BASE_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket timeout'));
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        wsHealth = true;
        ws.close();
        resolve(true);
      };
      
      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket error'));
      };
    });
  } catch (error) {
    console.error('WebSocket health check failed:', error);
  }
  
  return {
    api: apiHealth,
    websocket: wsHealth,
    features: config.features,
    performance: {
      timeout: config.performance.timeout,
      retryAttempts: config.performance.retryAttempts,
      systemRefresh: config.performance.dataRefreshIntervals.system,
    },
  };
};

// Configuration validator
export const validateConfig = (config: EnvironmentConfig): boolean => {
  const required = [
    'API_BASE_URL',
    'WS_BASE_URL', 
    'CINESTORY_API_URL',
    'CINESTORY_WS_URL',
    'AUTOMATION_API_URL',
  ];
  
  for (const key of required) {
    if (!config[key as keyof EnvironmentConfig]) {
      console.error(`Missing required configuration: ${key}`);
      return false;
    }
  }
  
  // Validate URLs
  try {
    new URL(config.API_BASE_URL);
    new URL(config.CINESTORY_API_URL);
    new URL(config.AUTOMATION_API_URL);
  } catch (error) {
    console.error('Invalid URL in configuration:', error);
    return false;
  }
  
  // Validate performance settings
  if (config.performance.timeout < 1000 || config.performance.timeout > 60000) {
    console.error('Invalid timeout value. Must be between 1000ms and 60000ms');
    return false;
  }
  
  return true;
};

// Export current config for immediate use
export const currentConfig = getConfig();

// Production readiness check
export const isProductionReady = async (): Promise<{
  ready: boolean;
  checks: Record<string, boolean>;
  warnings: string[];
}> => {
  const config = getConfig();
  const health = await checkEnvironmentHealth();
  const warnings: string[] = [];
  
  const checks = {
    configValid: validateConfig(config),
    apiHealthy: health.api,
    websocketHealthy: health.websocket,
    securityConfigured: !!config.security.apiKey,
    productionUrls: config.NODE_ENV === 'production' && 
                   config.API_BASE_URL.includes('cinestory.app'),
  };
  
  // Generate warnings
  if (!checks.apiHealthy) {
    warnings.push('API endpoint is not responding');
  }
  
  if (!checks.websocketHealthy) {
    warnings.push('WebSocket connection failed');
  }
  
  if (!checks.securityConfigured) {
    warnings.push('API key not configured');
  }
  
  if (config.NODE_ENV === 'production' && config.features.debugging) {
    warnings.push('Debug mode is enabled in production');
  }
  
  const ready = Object.values(checks).every(check => check === true);
  
  return {
    ready,
    checks,
    warnings,
  };
};