// -------------------- Production-Ready API Layer --------------------
import React from 'react';
import { getConfig, isDevelopment, isProduction } from '../config/environment';

// Enhanced API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Enhanced System Status
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

// Tool Status with more details
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

// Workflow Progress with enhanced tracking
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

// Ecosystem Node with detailed metrics
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

// API Client Class with enhanced features
class ProductionAPIClient {
  private config = getConfig();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private rateLimitMap: Map<string, number[]> = new Map();

  // Enhanced request method with retry logic and caching
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = true
  ): Promise<APIResponse<T>> {
    const url = `${this.config.CINESTORY_API_URL}${endpoint}`;
    const requestId = this.generateRequestId();
    
    // Check cache first
    if (useCache && this.config.performance.caching.enabled) {
      const cached = this.getCachedData(endpoint);
      if (cached) {
        return cached;
      }
    }

    // Rate limiting check
    if (this.isRateLimited(endpoint)) {
      throw new Error('Rate limit exceeded');
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'X-Client-Version': '2.4.1',
      'X-Environment': this.config.NODE_ENV,
      ...options.headers,
    };

    // Add authentication if available
    if (this.config.security.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.security.apiKey}`;
    }

    // Enhanced fetch with retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.performance.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.performance.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        
        // Handle API response format
        const apiResponse: APIResponse<T> = {
          success: response.ok,
          data: response.ok ? data.data || data : undefined,
          error: response.ok ? undefined : data.error || `HTTP ${response.status}`,
          message: data.message,
          timestamp: new Date().toISOString(),
          requestId,
          statusCode: response.status,
        };

        // Cache successful responses
        if (response.ok && useCache && this.config.performance.caching.enabled) {
          this.setCachedData(endpoint, apiResponse);
        }

        // Update rate limiting
        this.updateRateLimit(endpoint);

        return apiResponse;

      } catch (error) {
        lastError = error as Error;
        
        if (isDevelopment()) {
          console.warn(`API request attempt ${attempt + 1} failed:`, error);
        }

        // Don't retry on abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.performance.retryAttempts - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError?.message || 'Network error',
      timestamp: new Date().toISOString(),
      requestId,
      statusCode: 0,
    };
  }

  // Cache management
  private getCachedData(key: string): APIResponse<any> | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.config.performance.caching.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: APIResponse<any>): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Rate limiting
  private isRateLimited(endpoint: string): boolean {
    const now = Date.now();
    const requests = this.rateLimitMap.get(endpoint) || [];
    
    // Clean old requests (older than 1 minute)
    const recentRequests = requests.filter(time => now - time < 60000);
    
    // Check if we exceed 100 requests per minute
    return recentRequests.length >= 100;
  }

  private updateRateLimit(endpoint: string): void {
    const now = Date.now();
    const requests = this.rateLimitMap.get(endpoint) || [];
    requests.push(now);
    this.rateLimitMap.set(endpoint, requests);
  }

  // Utility methods
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== API ENDPOINTS ====================

  // System endpoints
  async getSystemStatus(): Promise<APIResponse<SystemStatus>> {
    return this.request<SystemStatus>('/system/status');
  }

  async getSystemHealth(): Promise<APIResponse<{ healthy: boolean; checks: Record<string, boolean> }>> {
    return this.request('/system/health');
  }

  // Tools endpoints
  async getToolsStatus(): Promise<APIResponse<ToolStatus[]>> {
    return this.request<ToolStatus[]>('/tools/status');
  }

  async launchTool(toolId: string): Promise<APIResponse<{ sessionId: string; redirectUrl: string }>> {
    return this.request(`/tools/${toolId}/launch`, {
      method: 'POST',
    }, false);
  }

  // Workflow endpoints
  async getWorkflowProgress(): Promise<APIResponse<WorkflowProgress[]>> {
    return this.request<WorkflowProgress[]>('/workflows/progress');
  }

  async startWorkflow(workflowId: string): Promise<APIResponse<{ workflowId: string; status: string }>> {
    return this.request(`/workflows/${workflowId}/start`, {
      method: 'POST',
    }, false);
  }

  // Ecosystem endpoints
  async getEcosystemNodes(): Promise<APIResponse<EcosystemNode[]>> {
    return this.request<EcosystemNode[]>('/ecosystem/nodes');
  }

  async connectToEcosystem(nodeId: string): Promise<APIResponse<{ sessionId: string; connectionUrl: string }>> {
    return this.request(`/ecosystem/${nodeId}/connect`, {
      method: 'POST',
    }, false);
  }

  // Project management
  async createProject(): Promise<APIResponse<{ projectId: string; redirectUrl: string }>> {
    return this.request('/projects/create', {
      method: 'POST',
    }, false);
  }

  async importMedia(files: FileList): Promise<APIResponse<{ jobId: string; uploadUrl: string }>> {
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    return this.request('/media/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    }, false);
  }

  // Automation endpoints
  async getAutomationWorkflows(): Promise<APIResponse<any[]>> {
    return this.request('/automation/workflows');
  }

  async startAutomationWorkflow(workflowId: string): Promise<APIResponse<{ workflowId: string; status: string }>> {
    return this.request(`/automation/workflows/${workflowId}/start`, {
      method: 'POST',
    }, false);
  }

  async pauseAutomationWorkflow(workflowId: string): Promise<APIResponse<{ workflowId: string; status: string }>> {
    return this.request(`/automation/workflows/${workflowId}/pause`, {
      method: 'POST',
    }, false);
  }

  async stopAutomationWorkflow(workflowId: string): Promise<APIResponse<{ workflowId: string; status: string }>> {
    return this.request(`/automation/workflows/${workflowId}/stop`, {
      method: 'POST',
    }, false);
  }

  async createAutomationWorkflow(workflowData: any): Promise<APIResponse<{ workflowId: string }>> {
    return this.request('/automation/workflows/create', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    }, false);
  }

  async getAutomationTasks(): Promise<APIResponse<any[]>> {
    return this.request('/automation/tasks');
  }

  async retryAutomationTask(taskId: string): Promise<APIResponse<{ taskId: string; status: string }>> {
    return this.request(`/automation/tasks/${taskId}/retry`, {
      method: 'POST',
    }, false);
  }

  async getAutomationMetrics(): Promise<APIResponse<any>> {
    return this.request('/automation/metrics');
  }

  // Analytics endpoints (production only)
  async trackEvent(event: string, data: any): Promise<APIResponse<{ tracked: boolean }>> {
    if (!this.config.features.analytics) {
      return {
        success: true,
        data: { tracked: false },
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        statusCode: 200,
      };
    }

    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
    }, false);
  }
}

// Singleton instance
export const productionApi = new ProductionAPIClient();

// Enhanced Real-time Data Hook with WebSocket support
export function useRealTimeData<T>(
  endpoint: string,
  interval: number = 5000,
  useWebSocket: boolean = false
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  React.useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;
    let websocket: WebSocket | null = null;

    const fetchData = async () => {
      if (!mounted) return;
      
      try {
        const response = await productionApi.request<T>(endpoint);
        
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

    // Initialize with HTTP request
    fetchData();

    // Setup WebSocket if enabled and available
    if (useWebSocket && getConfig().features.realTimeUpdates) {
      try {
        const wsUrl = `${getConfig().CINESTORY_WS_URL}${endpoint}`;
        websocket = new WebSocket(wsUrl);
        
        websocket.onmessage = (event) => {
          if (!mounted) return;
          
          try {
            const update = JSON.parse(event.data);
            setData(update);
            setLastUpdated(new Date());
            setError(null);
          } catch (err) {
            console.error('WebSocket message parse error:', err);
          }
        };

        websocket.onerror = () => {
          if (!mounted) return;
          // Fallback to polling on WebSocket error
          intervalId = setInterval(fetchData, interval);
        };

      } catch (err) {
        // Fallback to polling if WebSocket fails
        intervalId = setInterval(fetchData, interval);
      }
    } else {
      // Use polling
      intervalId = setInterval(fetchData, interval);
    }

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      if (websocket) {
        websocket.close();
      }
    };
  }, [endpoint, interval, useWebSocket]);

  return { data, loading, error, lastUpdated };
}

// Re-export for compatibility
export const api = productionApi;
export type { SystemStatus, ToolStatus, WorkflowProgress, EcosystemNode };