#!/usr/bin/env node

// CineStory Health Check Script
// Comprehensive health monitoring for production deployment

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  services: [
    {
      name: 'Frontend',
      url: 'http://localhost:3000/health',
      timeout: 5000,
      critical: true
    },
    {
      name: 'API',
      url: 'http://localhost:3001/health',
      timeout: 5000,
      critical: true
    },
    {
      name: 'WebSocket',
      url: 'http://localhost:3002/health',
      timeout: 5000,
      critical: true
    },
    {
      name: 'Automation',
      url: 'http://localhost:3003/health',
      timeout: 5000,
      critical: false
    }
  ],
  database: {
    host: 'localhost',
    port: 5432,
    timeout: 3000
  },
  redis: {
    host: 'localhost',
    port: 6379,
    timeout: 3000
  },
  thresholds: {
    cpu: 80,        // CPU usage threshold (%)
    memory: 85,     // Memory usage threshold (%)
    disk: 90,       // Disk usage threshold (%)
    responseTime: 1000  // Response time threshold (ms)
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = (message, color = colors.reset) => {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, colors.green);
const error = (message) => log(`❌ ${message}`, colors.red);
const warning = (message) => log(`⚠️  ${message}`, colors.yellow);
const info = (message) => log(`ℹ️  ${message}`, colors.blue);

// HTTP health check
const checkHttpService = async (service) => {
  const startTime = Date.now();
  
  try {
    const fetch = (await import('node-fetch')).default;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), service.timeout);
    
    const response = await fetch(service.url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'User-Agent': 'CineStory-HealthCheck/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const status = responseTime > CONFIG.thresholds.responseTime ? 'slow' : 'healthy';
      return {
        name: service.name,
        status,
        responseTime,
        statusCode: response.status,
        error: null
      };
    } else {
      return {
        name: service.name,
        status: 'unhealthy',
        responseTime,
        statusCode: response.status,
        error: `HTTP ${response.status}`
      };
    }
  } catch (err) {
    const responseTime = Date.now() - startTime;
    return {
      name: service.name,
      status: 'down',
      responseTime,
      statusCode: 0,
      error: err.message
    };
  }
};

// Database health check
const checkDatabase = async () => {
  try {
    const { Client } = require('pg');
    const client = new Client({
      host: CONFIG.database.host,
      port: CONFIG.database.port,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'cinestory',
      connectionTimeoutMillis: CONFIG.database.timeout,
    });
    
    const startTime = Date.now();
    await client.connect();
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    const responseTime = Date.now() - startTime;
    
    await client.end();
    
    return {
      name: 'PostgreSQL',
      status: 'healthy',
      responseTime,
      result: result.rows[0],
      error: null
    };
  } catch (err) {
    return {
      name: 'PostgreSQL',
      status: 'unhealthy',
      responseTime: CONFIG.database.timeout,
      result: null,
      error: err.message
    };
  }
};

// Redis health check
const checkRedis = async () => {
  try {
    const redis = require('redis');
    const client = redis.createClient({
      host: CONFIG.redis.host,
      port: CONFIG.redis.port,
      connectTimeout: CONFIG.redis.timeout
    });
    
    const startTime = Date.now();
    await client.connect();
    
    // Test ping
    const pong = await client.ping();
    const responseTime = Date.now() - startTime;
    
    await client.quit();
    
    return {
      name: 'Redis',
      status: 'healthy',
      responseTime,
      result: pong,
      error: null
    };
  } catch (err) {
    return {
      name: 'Redis',
      status: 'unhealthy',
      responseTime: CONFIG.redis.timeout,
      result: null,
      error: err.message
    };
  }
};

// Docker container health check
const checkDockerContainers = () => {
  try {
    const output = execSync('docker-compose ps --format json', { encoding: 'utf8' });
    const containers = output.trim().split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    
    const results = containers.map(container => ({
      name: container.Service,
      status: container.State === 'running' ? 'healthy' : 'unhealthy',
      state: container.State,
      ports: container.Publishers || [],
      error: container.State !== 'running' ? `Container state: ${container.State}` : null
    }));
    
    return results;
  } catch (err) {
    return [{
      name: 'Docker',
      status: 'unhealthy',
      error: err.message
    }];
  }
};

// System resource check
const checkSystemResources = () => {
  try {
    // CPU usage
    const cpuUsage = execSync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | sed 's/%us,//'", { encoding: 'utf8' }).trim();
    
    // Memory usage
    const memInfo = execSync("free | grep Mem | awk '{printf \"%.1f\", ($3/$2) * 100.0}'", { encoding: 'utf8' }).trim();
    
    // Disk usage
    const diskUsage = execSync("df -h / | awk 'NR==2{printf \"%s\", $5}' | sed 's/%//'", { encoding: 'utf8' }).trim();
    
    const cpu = parseFloat(cpuUsage) || 0;
    const memory = parseFloat(memInfo) || 0;
    const disk = parseFloat(diskUsage) || 0;
    
    return {
      cpu: {
        value: cpu,
        status: cpu > CONFIG.thresholds.cpu ? 'warning' : 'healthy',
        threshold: CONFIG.thresholds.cpu
      },
      memory: {
        value: memory,
        status: memory > CONFIG.thresholds.memory ? 'warning' : 'healthy',
        threshold: CONFIG.thresholds.memory
      },
      disk: {
        value: disk,
        status: disk > CONFIG.thresholds.disk ? 'critical' : 'healthy',
        threshold: CONFIG.thresholds.disk
      }
    };
  } catch (err) {
    return {
      error: err.message
    };
  }
};

// SSL certificate check
const checkSSLCertificate = async (domain) => {
  try {
    const https = require('https');
    const { promisify } = require('util');
    
    return new Promise((resolve) => {
      const options = {
        hostname: domain,
        port: 443,
        method: 'GET',
        timeout: 5000
      };
      
      const req = https.request(options, (res) => {
        const cert = res.connection.getPeerCertificate();
        const now = new Date();
        const expiry = new Date(cert.valid_to);
        const daysUntilExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
        
        resolve({
          domain,
          status: daysUntilExpiry > 30 ? 'healthy' : daysUntilExpiry > 7 ? 'warning' : 'critical',
          expiryDate: cert.valid_to,
          daysUntilExpiry,
          issuer: cert.issuer.CN
        });
      });
      
      req.on('error', (err) => {
        resolve({
          domain,
          status: 'error',
          error: err.message
        });
      });
      
      req.on('timeout', () => {
        resolve({
          domain,
          status: 'timeout',
          error: 'Connection timeout'
        });
      });
      
      req.end();
    });
  } catch (err) {
    return {
      domain,
      status: 'error',
      error: err.message
    };
  }
};

// Generate health report
const generateReport = (results) => {
  const report = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    services: results.services,
    infrastructure: results.infrastructure,
    system: results.system,
    ssl: results.ssl || [],
    summary: {
      total: 0,
      healthy: 0,
      unhealthy: 0,
      warnings: 0
    }
  };
  
  // Calculate summary
  const allChecks = [
    ...results.services,
    ...results.infrastructure,
    ...(results.docker || [])
  ];
  
  report.summary.total = allChecks.length;
  report.summary.healthy = allChecks.filter(c => c.status === 'healthy').length;
  report.summary.unhealthy = allChecks.filter(c => c.status === 'unhealthy' || c.status === 'down').length;
  report.summary.warnings = allChecks.filter(c => c.status === 'warning' || c.status === 'slow').length;
  
  // Determine overall status
  if (report.summary.unhealthy > 0) {
    const criticalDown = allChecks.filter(c => 
      (c.status === 'unhealthy' || c.status === 'down') && 
      CONFIG.services.find(s => s.name === c.name)?.critical
    ).length;
    
    report.overall = criticalDown > 0 ? 'critical' : 'degraded';
  } else if (report.summary.warnings > 0) {
    report.overall = 'warning';
  }
  
  return report;
};

// Display results
const displayResults = (report) => {
  console.log('\n' + '='.repeat(60));
  console.log('🏥 CINESTORY HEALTH CHECK REPORT');
  console.log('='.repeat(60));
  
  // Overall status
  const statusColor = {
    'healthy': colors.green,
    'warning': colors.yellow,
    'degraded': colors.yellow,
    'critical': colors.red
  }[report.overall] || colors.red;
  
  log(`Overall Status: ${report.overall.toUpperCase()}`, statusColor);
  log(`Timestamp: ${report.timestamp}`, colors.cyan);
  
  // Summary
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(30));
  info(`Total Checks: ${report.summary.total}`);
  success(`Healthy: ${report.summary.healthy}`);
  if (report.summary.warnings > 0) warning(`Warnings: ${report.summary.warnings}`);
  if (report.summary.unhealthy > 0) error(`Unhealthy: ${report.summary.unhealthy}`);
  
  // Services
  console.log('\n🚀 SERVICES');
  console.log('-'.repeat(30));
  report.services.forEach(service => {
    const statusIcon = {
      'healthy': '✅',
      'slow': '🐌',
      'unhealthy': '❌',
      'down': '💀'
    }[service.status] || '❓';
    
    console.log(`${statusIcon} ${service.name}: ${service.status} (${service.responseTime}ms)`);
    if (service.error) {
      error(`   Error: ${service.error}`);
    }
  });
  
  // Infrastructure
  console.log('\n🏗️  INFRASTRUCTURE');
  console.log('-'.repeat(30));
  report.infrastructure.forEach(infra => {
    const statusIcon = {
      'healthy': '✅',
      'unhealthy': '❌'
    }[infra.status] || '❓';
    
    console.log(`${statusIcon} ${infra.name}: ${infra.status} (${infra.responseTime}ms)`);
    if (infra.error) {
      error(`   Error: ${infra.error}`);
    }
  });
  
  // System Resources
  if (report.system && !report.system.error) {
    console.log('\n💻 SYSTEM RESOURCES');
    console.log('-'.repeat(30));
    
    Object.entries(report.system).forEach(([resource, data]) => {
      if (data.value !== undefined) {
        const statusIcon = {
          'healthy': '✅',
          'warning': '⚠️',
          'critical': '🚨'
        }[data.status] || '❓';
        
        console.log(`${statusIcon} ${resource.toUpperCase()}: ${data.value}% (threshold: ${data.threshold}%)`);
      }
    });
  }
  
  // SSL Certificates
  if (report.ssl && report.ssl.length > 0) {
    console.log('\n🔒 SSL CERTIFICATES');
    console.log('-'.repeat(30));
    report.ssl.forEach(ssl => {
      const statusIcon = {
        'healthy': '✅',
        'warning': '⚠️',
        'critical': '🚨',
        'error': '❌',
        'timeout': '⏰'
      }[ssl.status] || '❓';
      
      console.log(`${statusIcon} ${ssl.domain}: ${ssl.status}`);
      if (ssl.daysUntilExpiry !== undefined) {
        console.log(`   Expires in ${ssl.daysUntilExpiry} days (${ssl.expiryDate})`);
      }
      if (ssl.error) {
        error(`   Error: ${ssl.error}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  return report.overall === 'healthy' ? 0 : 1;
};

// Save report to file
const saveReport = (report) => {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `health-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  info(`Report saved to: ${filepath}`);
  
  // Keep only last 10 reports
  const files = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('health-report-'))
    .sort()
    .reverse();
    
  if (files.length > 10) {
    files.slice(10).forEach(file => {
      fs.unlinkSync(path.join(reportsDir, file));
    });
  }
};

// Main health check function
const runHealthCheck = async () => {
  info('Starting CineStory health check...');
  
  const results = {
    services: [],
    infrastructure: [],
    system: null,
    docker: [],
    ssl: []
  };
  
  // Check HTTP services
  info('Checking HTTP services...');
  for (const service of CONFIG.services) {
    const result = await checkHttpService(service);
    results.services.push(result);
  }
  
  // Check infrastructure
  info('Checking infrastructure...');
  const [dbResult, redisResult] = await Promise.all([
    checkDatabase(),
    checkRedis()
  ]);
  results.infrastructure.push(dbResult, redisResult);
  
  // Check Docker containers
  info('Checking Docker containers...');
  results.docker = checkDockerContainers();
  
  // Check system resources
  info('Checking system resources...');
  results.system = checkSystemResources();
  
  // Check SSL certificates (if in production)
  if (process.env.NODE_ENV === 'production') {
    info('Checking SSL certificates...');
    const domains = ['cinestory.app', 'api.cinestory.app'];
    results.ssl = await Promise.all(
      domains.map(domain => checkSSLCertificate(domain))
    );
  }
  
  // Generate and display report
  const report = generateReport(results);
  const exitCode = displayResults(report);
  
  // Save report
  saveReport(report);
  
  return exitCode;
};

// Run health check
if (require.main === module) {
  runHealthCheck()
    .then(exitCode => process.exit(exitCode))
    .catch(err => {
      error(`Health check failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runHealthCheck, checkHttpService, checkDatabase, checkRedis };