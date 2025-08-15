// -------------------- CineStory API Layer with Mock Data --------------------
import React from 'react';
import { getConfig, isDevelopment, isProduction } from '../config/environment';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
  statusCode: number;
}

// System Status
export interface SystemStatus {
  uptime: string;
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  activeProjects: number;
  globalNodes: number;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    api: 'healthy' | 'degraded' | 'down';
    websocket: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    storage: 'healthy' | 'degraded' | 'down';
  };
}

// Tool Status
export interface ToolStatus {
  id: string;
  name: string;
  status: 'ready' | 'active' | 'processing' | 'maintenance' | 'offline';
  version: string;
  lastUsed: string;
  projectsCount: number;
  healthScore: number;
  performance: number;
  uptime: string;
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  capabilities: string[];
  dependencies: string[];
}

// Workflow Progress
export interface WorkflowProgress {
  id: string;
  name: string;
  type: string;
  progress: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  currentTask: string;
  estimatedCompletion: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  startTime: string;
  lastUpdated: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedWorkers: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

// Ecosystem Node
export interface EcosystemNode {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  activeUsers: number;
  performance: number;
  latency: number;
  capacity: number;
  region: string;
  lastPing: string;
  services: string[];
  metrics: {
    throughput: number;
    errorRate: number;
    responseTime: number;
  };
}

// Mock Data Generator
const generateMockData = () => {
  const systemStatus: SystemStatus = {
    uptime: '99.97%',
    cpu: Math.floor(Math.random() * 30) + 15, // 15-45%
    memory: Math.floor(Math.random() * 20) + 40, // 40-60%
    storage: Math.floor(Math.random() * 15) + 25, // 25-40%
    network: Math.floor(Math.random() * 10) + 8, // 8-18ms
    activeProjects: Math.floor(Math.random() * 50) + 120,
    globalNodes: 2847,
    version: '2.4.1',
    environment: getConfig().NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      websocket: 'healthy',
      database: 'healthy',
      storage: 'healthy',
    },
  };

  const toolsStatus: ToolStatus[] = [
    {
      id: 'studio',
      name: 'CineStory Studio',
      status: 'ready',
      version: '2.4.1',
      lastUsed: 'Recently',
      projectsCount: Math.floor(Math.random() * 20) + 5,
      healthScore: Math.floor(Math.random() * 10) + 90,
      performance: Math.floor(Math.random() * 15) + 85,
      uptime: '99.98%',
      resources: { cpu: 25, memory: 45, storage: 30 },
      capabilities: ['Timeline Editor', 'Multi-track Support', 'Real-time Preview'],
      dependencies: ['ffmpeg', 'opencv', 'tensorflow'],
    },
    {
      id: 'autocut',
      name: 'AutoCut AI',
      status: 'processing',
      version: '1.8.3',
      lastUsed: 'Recently',
      projectsCount: Math.floor(Math.random() * 15) + 3,
      healthScore: Math.floor(Math.random() * 10) + 90,
      performance: Math.floor(Math.random() * 20) + 80,
      uptime: '99.95%',
      resources: { cpu: 45, memory: 60, storage: 20 },
      capabilities: ['Auto Scene Detection', 'Smart Cuts', 'Beat Sync'],
      dependencies: ['tensorflow', 'pytorch', 'opencv'],
    },
    {
      id: 'color',
      name: 'Color Grading Pro',
      status: 'ready',
      version: '3.1.0',
      lastUsed: 'Recently',
      projectsCount: Math.floor(Math.random() * 25) + 8,
      healthScore: Math.floor(Math.random() * 5) + 95,
      performance: Math.floor(Math.random() * 12) + 88,
      uptime: '99.99%',
      resources: { cpu: 30, memory: 40, storage: 15 },
      capabilities: ['LUT Support', 'Color Wheels', 'Scopes'],
      dependencies: ['opencl', 'cuda', 'opengl'],
    },
    {
      id: 'audio',
      name: 'Audio Master',
      status: 'ready',
      version: '2.0.5',
      lastUsed: 'Recently',
      projectsCount: Math.floor(Math.random() * 18) + 6,
      healthScore: Math.floor(Math.random() * 8) + 92,
      performance: Math.floor(Math.random() * 18) + 82,
      uptime: '99.96%',
      resources: { cpu: 20, memory: 35, storage: 25 },
      capabilities: ['Multi-track Audio', 'Effects Rack', 'Audio Cleanup'],
      dependencies: ['portaudio', 'fftw', 'ladspa'],
    },
  ];

  const workflowProgress: WorkflowProgress[] = [
    {
      id: 'black-frame',
      name: 'Black Frame Philosophy',
      type: 'black-frame',
      progress: Math.floor(Math.random() * 20) + 70,
      status: 'running',
      currentTask: 'Scene Analysis',
      estimatedCompletion: `${Math.floor(Math.random() * 3) + 1} hours`,
      totalTasks: 12,
      completedTasks: 8,
      failedTasks: 0,
      startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      lastUpdated: new Date().toISOString(),
      priority: 'high',
      assignedWorkers: 3,
      resourceUsage: { cpu: 65, memory: 70, storage: 45 },
    },
    {
      id: 'ffz',
      name: 'Film From Zero',
      type: 'ffz',
      progress: Math.floor(Math.random() * 15) + 80,
      status: 'running',
      currentTask: 'Asset Processing',
      estimatedCompletion: `${Math.floor(Math.random() * 2) + 1} hour`,
      totalTasks: 15,
      completedTasks: 12,
      failedTasks: 1,
      startTime: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      lastUpdated: new Date().toISOString(),
      priority: 'medium',
      assignedWorkers: 2,
      resourceUsage: { cpu: 55, memory: 60, storage: 35 },
    },
    {
      id: 'eyemotion',
      name: 'EyeMotion Workflow',
      type: 'eyemotion',
      progress: Math.floor(Math.random() * 25) + 65,
      status: 'running',
      currentTask: 'Emotion Detection',
      estimatedCompletion: `${Math.floor(Math.random() * 4) + 2} hours`,
      totalTasks: 18,
      completedTasks: 12,
      failedTasks: 0,
      startTime: new Date(Date.now() - Math.random() * 5400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      priority: 'high',
      assignedWorkers: 4,
      resourceUsage: { cpu: 75, memory: 80, storage: 55 },
    },
    {
      id: 'trustvault',
      name: 'TrustVault Security',
      type: 'trustvault',
      progress: Math.floor(Math.random() * 10) + 85,
      status: 'running',
      currentTask: 'Blockchain Verification',
      estimatedCompletion: `${Math.floor(Math.random() * 60) + 15} minutes`,
      totalTasks: 8,
      completedTasks: 7,
      failedTasks: 0,
      startTime: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      lastUpdated: new Date().toISOString(),
      priority: 'critical',
      assignedWorkers: 1,
      resourceUsage: { cpu: 35, memory: 40, storage: 20 },
    },
  ];

  const ecosystemNodes: EcosystemNode[] = [
    {
      id: 'filmConnect',
      name: 'Film Connect Network',
      type: 'network',
      status: 'online',
      activeUsers: Math.floor(Math.random() * 500) + 2000,
      performance: Math.floor(Math.random() * 5) + 95,
      latency: Math.floor(Math.random() * 8) + 8,
      capacity: Math.floor(Math.random() * 20) + 75,
      region: 'Global',
      lastPing: new Date().toISOString(),
      services: ['Connection Hub', 'Collaboration Tools', 'Project Sharing'],
      metrics: { throughput: 1250, errorRate: 0.02, responseTime: 45 },
    },
    {
      id: 'rightsVault',
      name: 'Rights Vault',
      type: 'security',
      status: 'online',
      activeUsers: Math.floor(Math.random() * 200) + 700,
      performance: Math.floor(Math.random() * 8) + 92,
      latency: Math.floor(Math.random() * 5) + 5,
      capacity: Math.floor(Math.random() * 15) + 85,
      region: 'US-East-1',
      lastPing: new Date().toISOString(),
      services: ['Asset Protection', 'Rights Management', 'Blockchain Storage'],
      metrics: { throughput: 890, errorRate: 0.01, responseTime: 32 },
    },
    {
      id: 'distributeNet',
      name: 'Distribution Network',
      type: 'distribution',
      status: 'online',
      activeUsers: Math.floor(Math.random() * 400) + 1200,
      performance: Math.floor(Math.random() * 6) + 94,
      latency: Math.floor(Math.random() * 10) + 10,
      capacity: Math.floor(Math.random() * 25) + 70,
      region: 'Global',
      lastPing: new Date().toISOString(),
      services: ['Content Delivery', 'Global Distribution', 'Streaming'],
      metrics: { throughput: 2100, errorRate: 0.03, responseTime: 78 },
    },
    {
      id: 'filmMarket',
      name: 'Film Marketplace',
      type: 'marketplace',
      status: 'online',
      activeUsers: Math.floor(Math.random() * 800) + 2500,
      performance: Math.floor(Math.random() * 3) + 97,
      latency: Math.floor(Math.random() * 12) + 12,
      capacity: Math.floor(Math.random() * 35) + 60,
      region: 'US-West-2',
      lastPing: new Date().toISOString(),
      services: ['Content Marketplace', 'Licensing', 'Revenue Sharing'],
      metrics: { throughput: 1890, errorRate: 0.015, responseTime: 56 },
    },
  ];

  return {
    systemStatus,
    toolsStatus,
    workflowProgress,
    ecosystemNodes,
  };
};

// API Client Class
class CineStoryAPIClient {
  private config = getConfig();
  private mockData = generateMockData();

  // Simulate API delay
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create mock response
  private createResponse<T>(data: T, success: boolean = true): APIResponse<T> {
    return {
      success,
      data: success ? data : undefined,
      error: success ? undefined : 'Mock API Error',
      message: success ? 'Success' : 'Request failed',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      statusCode: success ? 200 : 500,
    };
  }

  // System endpoints
  async getSystemStatus(): Promise<APIResponse<SystemStatus>> {
    await this.delay();
    // Update mock data with fresh values
    this.mockData = generateMockData();
    return this.createResponse(this.mockData.systemStatus);
  }

  // Tools endpoints
  async getToolsStatus(): Promise<APIResponse<ToolStatus[]>> {
    await this.delay();
    return this.createResponse(this.mockData.toolsStatus);
  }

  async launchTool(toolId: string): Promise<APIResponse<{ sessionId: string; redirectUrl: string }>> {
    await this.delay(500);
    
    const sessionId = `session_${toolId}_${Date.now()}`;
    const redirectUrl = isDevelopment() 
      ? `http://localhost:3000/tools/${toolId}?session=${sessionId}`
      : `https://tools.cinestory.app/${toolId}?session=${sessionId}`;

    return this.createResponse({
      sessionId,
      redirectUrl,
    });
  }

  // Workflow endpoints
  async getWorkflowProgress(): Promise<APIResponse<WorkflowProgress[]>> {
    await this.delay();
    return this.createResponse(this.mockData.workflowProgress);
  }

  // Ecosystem endpoints
  async getEcosystemNodes(): Promise<APIResponse<EcosystemNode[]>> {
    await this.delay();
    return this.createResponse(this.mockData.ecosystemNodes);
  }

  async connectToEcosystem(nodeId: string): Promise<APIResponse<{ sessionId: string; connectionUrl: string }>> {
    await this.delay(400);
    
    const sessionId = `eco_${nodeId}_${Date.now()}`;
    const connectionUrl = isDevelopment()
      ? `http://localhost:3000/ecosystem/${nodeId}?session=${sessionId}`
      : `https://ecosystem.cinestory.app/${nodeId}?session=${sessionId}`;

    return this.createResponse({
      sessionId,
      connectionUrl,
    });
  }

  // Project management
  async createProject(): Promise<APIResponse<{ projectId: string; redirectUrl: string }>> {
    await this.delay(600);
    
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const redirectUrl = isDevelopment()
      ? `http://localhost:3000/projects/${projectId}`
      : `https://studio.cinestory.app/projects/${projectId}`;

    return this.createResponse({
      projectId,
      redirectUrl,
    });
  }

  async importMedia(files: FileList): Promise<APIResponse<{ jobId: string; uploadUrl: string }>> {
    await this.delay(800);
    
    const jobId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const uploadUrl = isDevelopment()
      ? `http://localhost:3000/api/upload?job=${jobId}`
      : `https://api.cinestory.app/upload?job=${jobId}`;

    // Log file info in development
    if (isDevelopment()) {
      console.log(`Mock import for ${files.length} files:`, Array.from(files).map(f => f.name));
    }

    return this.createResponse({
      jobId,
      uploadUrl,
    });
  }
}

// Singleton instance
export const api = new CineStoryAPIClient();

// Real-time Data Hook
export function useRealTimeData<T>(
  endpoint: string,
  interval: number = 5000
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  React.useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      if (!mounted) return;
      
      try {
        let response: APIResponse<T>;
        
        // Route to appropriate API method based on endpoint
        switch (endpoint) {
          case '/system/status':
            response = await api.getSystemStatus() as APIResponse<T>;
            break;
          case '/tools/status':
            response = await api.getToolsStatus() as APIResponse<T>;
            break;
          case '/workflows/progress':
            response = await api.getWorkflowProgress() as APIResponse<T>;
            break;
          case '/ecosystem/nodes':
            response = await api.getEcosystemNodes() as APIResponse<T>;
            break;
          default:
            throw new Error(`Unsupported endpoint: ${endpoint}`);
        }
        
        if (!mounted) return;
        
        if (response.success && response.data) {
          setData(response.data);
          setError(null);
          setLastUpdated(new Date());
        } else {
          setError(response.error || 'Failed to fetch data');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    intervalId = setInterval(fetchData, interval);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [endpoint, interval]);

  return { data, loading, error, lastUpdated };
}