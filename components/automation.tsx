import React, { useState, useEffect, useCallback } from 'react';
import { api, useRealTimeData } from '../utils/api';
import { getConfig, isDevelopment } from '../config/environment';
import { useCineStoryTheme, getLocalizedContent } from './cinestory-theme';

// Automation Types & Interfaces
export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  type: 'scene-detection' | 'audio-sync' | 'color-matching' | 'motion-tracking' | 'subtitle-generation';
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  remainingTime: string;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  projectId?: string;
  mediaId?: string;
  settings: Record<string, any>;
  dependencies: string[];
  outputs: string[];
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  tasks: AutomationTask[];
  status: 'draft' | 'active' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  createdAt: string;
  updatedAt: string;
  schedule?: {
    type: 'manual' | 'scheduled' | 'trigger';
    cron?: string;
    triggers?: string[];
  };
}

export interface AutomationMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedToday: number;
  failedToday: number;
  averageExecutionTime: number;
  successRate: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
  queueLength: number;
}

// Automation Component
export const CineStoryAutomation: React.FC = () => {
  const theme = useCineStoryTheme();
  const config = getConfig();
  const [language, setLanguage] = useState<'EN' | 'TH'>('EN');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [automationError, setAutomationError] = useState<string | null>(null);

  const content = getLocalizedContent(language);

  // Real-time data hooks
  const { data: workflows, loading: workflowsLoading, error: workflowsError } = useRealTimeData<AutomationWorkflow[]>('/automation/workflows', 5000);
  const { data: tasks, loading: tasksLoading, error: tasksError } = useRealTimeData<AutomationTask[]>('/automation/tasks', 3000);
  const { data: metrics, loading: metricsLoading, error: metricsError } = useRealTimeData<AutomationMetrics>('/automation/metrics', 10000);

  // Handle automation task actions
  const handleStartWorkflow = useCallback(async (workflowId: string) => {
    try {
      const response = await api.startAutomationWorkflow(workflowId);
      if (response.success) {
        console.log('Workflow started:', response.data);
        setAutomationError(null);
      } else {
        setAutomationError(response.error || 'Failed to start workflow');
      }
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Network error');
      console.error('Failed to start workflow:', error);
    }
  }, []);

  const handlePauseWorkflow = useCallback(async (workflowId: string) => {
    try {
      const response = await api.pauseAutomationWorkflow(workflowId);
      if (response.success) {
        console.log('Workflow paused:', response.data);
        setAutomationError(null);
      } else {
        setAutomationError(response.error || 'Failed to pause workflow');
      }
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Network error');
      console.error('Failed to pause workflow:', error);
    }
  }, []);

  const handleStopWorkflow = useCallback(async (workflowId: string) => {
    try {
      const response = await api.stopAutomationWorkflow(workflowId);
      if (response.success) {
        console.log('Workflow stopped:', response.data);
        setAutomationError(null);
      } else {
        setAutomationError(response.error || 'Failed to stop workflow');
      }
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Network error');
      console.error('Failed to stop workflow:', error);
    }
  }, []);

  const handleCreateWorkflow = useCallback(async (workflowData: Partial<AutomationWorkflow>) => {
    setIsCreatingWorkflow(true);
    try {
      const response = await api.createAutomationWorkflow(workflowData);
      if (response.success) {
        console.log('Workflow created:', response.data);
        setAutomationError(null);
        setSelectedWorkflow(response.data?.workflowId);
      } else {
        setAutomationError(response.error || 'Failed to create workflow');
      }
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Network error');
      console.error('Failed to create workflow:', error);
    } finally {
      setIsCreatingWorkflow(false);
    }
  }, []);

  const handleRetryTask = useCallback(async (taskId: string) => {
    try {
      const response = await api.retryAutomationTask(taskId);
      if (response.success) {
        console.log('Task retry initiated:', response.data);
        setAutomationError(null);
      } else {
        setAutomationError(response.error || 'Failed to retry task');
      }
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Network error');
      console.error('Failed to retry task:', error);
    }
  }, []);

  // Task type configurations
  const taskTypes = [
    {
      type: 'scene-detection',
      name: 'Scene Detection',
      icon: '🎬',
      description: 'Automatically detect scene changes and create markers',
      color: '#3b82f6',
      category: 'Analysis'
    },
    {
      type: 'audio-sync',
      name: 'Audio Synchronization',
      icon: '🎵',
      description: 'Sync audio tracks with video automatically',
      color: '#8b5cf6',
      category: 'Audio'
    },
    {
      type: 'color-matching',
      name: 'Color Matching',
      icon: '🎨',
      description: 'Match colors across clips and apply corrections',
      color: '#f59e0b',
      category: 'Color'
    },
    {
      type: 'motion-tracking',
      name: 'Motion Tracking',
      icon: '📍',
      description: 'Track objects and apply motion effects',
      color: '#10b981',
      category: 'Effects'
    },
    {
      type: 'subtitle-generation',
      name: 'Subtitle Generation',
      icon: '📝',
      description: 'Auto-generate subtitles from speech',
      color: '#ef4444',
      category: 'Text'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#10b981';
      case 'completed': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="min-h-screen bg-studio-black-deepest text-light-stroke-primary">
      {/* Header */}
      <header className="border-b border-light-stroke-accent/20 panel-studio-depth backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl text-light-stroke-highlight animate-light-stroke">
                  CineStory Automation
                </h1>
                <p className="text-sm text-light-glow-accent mt-1">Intelligent workflow automation system</p>
              </div>
              
              {automationError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <span className="text-red-400 text-sm">⚠️</span>
                  <span className="text-red-400 text-sm">{automationError}</span>
                  <button 
                    onClick={() => setAutomationError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleCreateWorkflow({
                  name: 'New Workflow',
                  description: 'Auto-generated workflow',
                  tasks: []
                })}
                disabled={isCreatingWorkflow}
                className="btn-studio-light flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <span>{isCreatingWorkflow ? '⏳' : '➕'}</span>
                <span className="text-sm">New Workflow</span>
              </button>

              <div className="flex items-center space-x-1 bg-studio-black-medium/50 rounded-lg p-1 border border-light-stroke-accent/20">
                <button
                  onClick={() => setLanguage('EN')}
                  className={`px-3 py-1 text-xs text-light-stroke-accent rounded-md transition-all ${
                    language === 'EN' ? 'bg-light-stroke-accent/20 text-light-stroke-primary shadow-studio-depth-1' : 'hover:text-light-stroke-primary'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('TH')}
                  className={`px-3 py-1 text-xs text-light-stroke-accent rounded-md transition-all ${
                    language === 'TH' ? 'bg-light-stroke-accent/20 text-light-stroke-primary shadow-studio-depth-1' : 'hover:text-light-stroke-primary'
                  }`}
                >
                  TH
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Metrics Dashboard */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricsLoading ? (
              <div className="text-center text-light-glow-accent py-8">Loading metrics...</div>
            ) : metrics ? (
              <>
                <div className="panel-studio-depth rounded-lg p-4 animate-dimensional-glow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-light-glow-accent">Total Workflows</p>
                      <p className="text-2xl text-light-stroke-primary">{metrics.totalWorkflows}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-light-stroke-accent/20">
                      <span className="text-blue-400 text-xl">📋</span>
                    </div>
                  </div>
                </div>

                <div className="panel-studio-depth rounded-lg p-4 animate-dimensional-glow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-light-glow-accent">Active Now</p>
                      <p className="text-2xl text-green-400">{metrics.activeWorkflows}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-light-stroke-accent/20">
                      <span className="text-green-400 text-xl">⚡</span>
                    </div>
                  </div>
                </div>

                <div className="panel-studio-depth rounded-lg p-4 animate-dimensional-glow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-light-glow-accent">Success Rate</p>
                      <p className="text-2xl text-emerald-400">{metrics.successRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-light-stroke-accent/20">
                      <span className="text-emerald-400 text-xl">✅</span>
                    </div>
                  </div>
                </div>

                <div className="panel-studio-depth rounded-lg p-4 animate-dimensional-glow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-light-glow-accent">Queue Length</p>
                      <p className="text-2xl text-orange-400">{metrics.queueLength}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center border border-light-stroke-accent/20">
                      <span className="text-orange-400 text-xl">⏳</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-4 text-center text-red-400">Failed to load metrics</div>
            )}
          </div>

          {/* Workflows Panel */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-light-stroke-accent animate-light-stroke">Active Workflows</h2>
              <div className="text-xs bg-light-stroke-accent/20 text-light-stroke-accent px-2 py-1 rounded-full border border-light-stroke-accent/30">
                {workflowsLoading ? 'Syncing...' : `${workflows?.length || 0} workflows`}
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {workflowsLoading ? (
                <div className="text-center text-light-glow-accent py-8">Loading workflows...</div>
              ) : workflows && workflows.length > 0 ? (
                workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                    className={`card-studio-depth rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                      selectedWorkflow === workflow.id ? 'shadow-studio-depth-3 border-light-stroke-accent' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full animate-pulse"
                          style={{ backgroundColor: getStatusColor(workflow.status) }}
                        ></div>
                        <h3 className="text-light-stroke-primary">{workflow.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {workflow.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePauseWorkflow(workflow.id);
                            }}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                          >
                            ⏸️
                          </button>
                        )}
                        {workflow.status === 'paused' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartWorkflow(workflow.id);
                            }}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            ▶️
                          </button>
                        )}
                        {(workflow.status === 'active' || workflow.status === 'paused') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStopWorkflow(workflow.id);
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ⏹️
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-light-glow-accent mb-3">{workflow.description}</p>

                    <div className="flex items-center justify-between text-xs text-light-glow">
                      <span>{workflow.completedTasks}/{workflow.totalTasks} tasks</span>
                      <span className="capitalize">{workflow.status}</span>
                    </div>

                    <div className="w-full bg-studio-black-surface rounded-full h-2 mt-2 border border-light-stroke-accent/20">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse"
                        style={{ width: `${workflow.progress}%` }}
                      ></div>
                    </div>

                    {selectedWorkflow === workflow.id && (
                      <div className="mt-4 pt-4 border-t border-light-stroke-accent/20">
                        <div className="space-y-2">
                          {workflow.tasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="flex items-center justify-between text-sm">
                              <span className="text-light-glow">{task.name}</span>
                              <div className="flex items-center space-x-2">
                                <span 
                                  className="w-2 h-2 rounded-full animate-pulse"
                                  style={{ backgroundColor: getStatusColor(task.status) }}
                                ></span>
                                <span className="text-light-glow-accent text-xs">{task.progress}%</span>
                              </div>
                            </div>
                          ))}
                          {workflow.tasks.length > 3 && (
                            <div className="text-xs text-light-glow">
                              +{workflow.tasks.length - 3} more tasks
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-light-glow-accent py-8">
                  <div className="text-4xl mb-2">🤖</div>
                  <p>No workflows found</p>
                  <p className="text-sm mt-1">Create your first automation workflow</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Panel */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-light-stroke-accent animate-light-stroke">Recent Tasks</h2>
              <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-400/30">
                {tasksLoading ? 'Syncing...' : `${tasks?.length || 0} tasks`}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasksLoading ? (
                <div className="text-center text-light-glow-accent py-8">Loading tasks...</div>
              ) : tasks && tasks.length > 0 ? (
                tasks.map((task) => {
                  const taskType = taskTypes.find(t => t.type === task.type);
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      className={`card-studio-depth rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                        selectedTask === task.id ? 'shadow-studio-depth-3 border-green-500/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span 
                            className="text-lg animate-dimensional-glow"
                            style={{ color: taskType?.color }}
                          >
                            {taskType?.icon}
                          </span>
                          <div>
                            <h4 className="text-sm text-light-stroke-primary">{task.name}</h4>
                            <p className="text-xs text-light-glow-accent">{taskType?.name || task.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          ></div>
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-light-glow mb-2">
                        <span>Progress: {task.progress}%</span>
                        <span>{task.remainingTime}</span>
                      </div>

                      <div className="w-full bg-studio-black-surface rounded-full h-1.5 border border-light-stroke-accent/20">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-300 animate-pulse"
                          style={{ 
                            width: `${task.progress}%`,
                            backgroundColor: getStatusColor(task.status)
                          }}
                        ></div>
                      </div>

                      {task.status === 'failed' && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-red-400">{task.errorMessage}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryTask(task.id);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {selectedTask === task.id && (
                        <div className="mt-3 pt-3 border-t border-light-stroke-accent/20">
                          <div className="text-xs text-light-glow-accent space-y-1">
                            <div>Type: {taskType?.category || 'Unknown'}</div>
                            <div>Priority: {task.priority}</div>
                            <div>Estimated: {task.estimatedTime}</div>
                            {task.startTime && <div>Started: {new Date(task.startTime).toLocaleString()}</div>}
                            {task.dependencies.length > 0 && (
                              <div>Dependencies: {task.dependencies.length}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-light-glow-accent py-8">
                  <div className="text-4xl mb-2">⚙️</div>
                  <p>No tasks running</p>
                  <p className="text-sm mt-1">All automations are idle</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Type Templates */}
        <div className="mt-8">
          <h2 className="text-xl text-light-stroke-accent animate-light-stroke mb-4">Automation Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {taskTypes.map((taskType) => (
              <div
                key={taskType.type}
                className="card-studio-depth rounded-lg p-4 transition-all duration-200 cursor-pointer group hover:scale-105"
                onClick={() => {
                  console.log('Creating task of type:', taskType.type);
                  // Here you could open a task creation modal
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center border-2 animate-dimensional-glow"
                    style={{ 
                      backgroundColor: `${taskType.color}20`,
                      borderColor: `${taskType.color}40`,
                      color: taskType.color
                    }}
                  >
                    <span className="text-xl">{taskType.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-light-stroke-primary group-hover:text-light-stroke-accent transition-colors">
                      {taskType.name}
                    </h3>
                    <p className="text-xs text-light-glow-accent">{taskType.category}</p>
                  </div>
                </div>
                <p className="text-sm text-light-glow">{taskType.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CineStoryAutomation;