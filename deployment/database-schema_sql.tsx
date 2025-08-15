-- CineStory Database Schema
-- Production-ready PostgreSQL schema for CineStory ecosystem

-- =============================================================================
-- DATABASE SETUP
-- =============================================================================

-- Create database if not exists (run this separately as superuser)
-- CREATE DATABASE cinestory WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';

-- Connect to cinestory database
\c cinestory;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "hstore";

-- =============================================================================
-- USER MANAGEMENT
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    password_hash TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user', 'viewer')),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PROJECT MANAGEMENT
-- =============================================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    project_type VARCHAR(50) DEFAULT 'video' CHECK (project_type IN ('video', 'audio', 'image', 'mixed')),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project collaborators
CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    permissions JSONB DEFAULT '{}',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- =============================================================================
-- MEDIA MANAGEMENT
-- =============================================================================

CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    duration INTERVAL,
    resolution VARCHAR(20),
    frame_rate DECIMAL(10,3),
    bit_rate BIGINT,
    codec VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    thumbnail_url TEXT,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media processing jobs
CREATE TABLE media_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('transcode', 'thumbnail', 'analysis', 'validation')),
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    input_params JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- WORKFLOW MANAGEMENT
-- =============================================================================

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    workflow_type VARCHAR(50) NOT NULL CHECK (workflow_type IN ('black-frame', 'ffz', 'eyemotion', 'trustvault')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    configuration JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE workflow_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    order_index INTEGER NOT NULL,
    dependencies JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- AUTOMATION SYSTEM
-- =============================================================================

CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_definition JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    trigger_type VARCHAR(50) CHECK (trigger_type IN ('manual', 'scheduled', 'event')),
    trigger_config JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE automation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    priority INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE automation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES automation_jobs(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    order_index INTEGER NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SYSTEM MONITORING
-- =============================================================================

CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tool_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id VARCHAR(100) NOT NULL UNIQUE,
    tool_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('online', 'offline', 'maintenance', 'error')),
    version VARCHAR(50),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    performance_metrics JSONB DEFAULT '{}',
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ecosystem_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id VARCHAR(100) NOT NULL UNIQUE,
    node_name VARCHAR(255) NOT NULL,
    node_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('online', 'offline', 'maintenance')),
    region VARCHAR(100),
    active_connections INTEGER DEFAULT 0,
    performance_metrics JSONB DEFAULT '{}',
    capabilities JSONB DEFAULT '[]',
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS & LOGGING
-- =============================================================================

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    endpoint TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER, -- milliseconds
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    request_size BIGINT,
    response_size BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Project indexes
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_updated ON projects(updated_at);
CREATE INDEX idx_project_collaborators_project ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user ON project_collaborators(user_id);

-- Media indexes
CREATE INDEX idx_media_files_project ON media_files(project_id);
CREATE INDEX idx_media_files_status ON media_files(status);
CREATE INDEX idx_media_files_created ON media_files(created_at);
CREATE INDEX idx_media_processing_jobs_media ON media_processing_jobs(media_file_id);
CREATE INDEX idx_media_processing_jobs_status ON media_processing_jobs(status);

-- Workflow indexes
CREATE INDEX idx_workflows_project ON workflows(project_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_type ON workflows(workflow_type);
CREATE INDEX idx_workflow_tasks_workflow ON workflow_tasks(workflow_id);
CREATE INDEX idx_workflow_tasks_status ON workflow_tasks(status);

-- Automation indexes
CREATE INDEX idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX idx_automation_jobs_workflow ON automation_jobs(workflow_id);
CREATE INDEX idx_automation_jobs_status ON automation_jobs(status);
CREATE INDEX idx_automation_jobs_priority ON automation_jobs(priority DESC);
CREATE INDEX idx_automation_tasks_job ON automation_tasks(job_id);
CREATE INDEX idx_automation_tasks_status ON automation_tasks(status);

-- Monitoring indexes
CREATE INDEX idx_system_metrics_name_time ON system_metrics(metric_name, recorded_at);
CREATE INDEX idx_tool_status_tool_id ON tool_status(tool_id);
CREATE INDEX idx_ecosystem_nodes_node_id ON ecosystem_nodes(node_id);
CREATE INDEX idx_ecosystem_nodes_status ON ecosystem_nodes(status);

-- Analytics indexes
CREATE INDEX idx_user_activities_user_time ON user_activities(user_id, created_at);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_api_logs_time ON api_logs(created_at);
CREATE INDEX idx_api_logs_status ON api_logs(status_code);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON media_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at BEFORE UPDATE ON automation_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_status_updated_at BEFORE UPDATE ON tool_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecosystem_nodes_updated_at BEFORE UPDATE ON ecosystem_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert default tool statuses
INSERT INTO tool_status (tool_id, tool_name, status, version, health_score) VALUES
('studio', 'CineStory Studio', 'online', '2.4.1', 98),
('autocut', 'AutoCut AI', 'online', '1.8.3', 94),
('color', 'Color Grading Pro', 'online', '3.1.0', 99),
('audio', 'Audio Master', 'online', '2.0.5', 96);

-- Insert default ecosystem nodes
INSERT INTO ecosystem_nodes (node_id, node_name, node_type, status, region, active_connections) VALUES
('filmConnect', 'Film Connect Network', 'network', 'online', 'global', 2400),
('rightsVault', 'Rights Vault', 'security', 'online', 'us-east-1', 847),
('distributeNet', 'Distribution Network', 'distribution', 'online', 'global', 1600),
('filmMarket', 'Film Marketplace', 'marketplace', 'online', 'us-west-2', 3200);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Active projects with collaborator count
CREATE VIEW active_projects_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.owner_id,
    u.full_name as owner_name,
    p.status,
    p.project_type,
    COUNT(pc.user_id) as collaborator_count,
    p.created_at,
    p.updated_at,
    p.last_accessed
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN project_collaborators pc ON p.id = pc.project_id
WHERE p.status = 'active'
GROUP BY p.id, u.full_name;

-- Workflow progress summary
CREATE VIEW workflow_progress_summary AS
SELECT 
    w.id,
    w.name,
    w.workflow_type,
    w.status,
    w.progress,
    COUNT(wt.id) as total_tasks,
    COUNT(CASE WHEN wt.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN wt.status = 'failed' THEN 1 END) as failed_tasks,
    w.created_at,
    w.started_at,
    w.completed_at
FROM workflows w
LEFT JOIN workflow_tasks wt ON w.id = wt.workflow_id
GROUP BY w.id;

-- System health overview
CREATE VIEW system_health_overview AS
SELECT 
    'tools' as component,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'online' THEN 1 END) as healthy,
    AVG(health_score) as avg_health_score
FROM tool_status
UNION ALL
SELECT 
    'ecosystem_nodes' as component,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'online' THEN 1 END) as healthy,
    AVG(active_connections) as avg_connections
FROM ecosystem_nodes;

-- =============================================================================
-- GRANTS & PERMISSIONS
-- =============================================================================

-- Create application user
CREATE USER cinestory_app WITH PASSWORD 'your_secure_password_here';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE cinestory TO cinestory_app;
GRANT USAGE ON SCHEMA public TO cinestory_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cinestory_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cinestory_app;

-- Grant permissions on views
GRANT SELECT ON active_projects_summary TO cinestory_app;
GRANT SELECT ON workflow_progress_summary TO cinestory_app;
GRANT SELECT ON system_health_overview TO cinestory_app;

-- Create read-only user for monitoring
CREATE USER cinestory_readonly WITH PASSWORD 'readonly_password_here';
GRANT CONNECT ON DATABASE cinestory TO cinestory_readonly;
GRANT USAGE ON SCHEMA public TO cinestory_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cinestory_readonly;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO cinestory_readonly;

COMMIT;