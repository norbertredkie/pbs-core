/**
 * Cost Tracking Dashboard for PBS + ClawRouter
 * 
 * Tracks:
 * - Cost per session
 * - Cost per task type
 * - Cost per model
 * - Monthly totals
 * - Savings vs baseline
 * - Alerts when thresholds exceeded
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('./logger');

class CostTracker {
  constructor(storagePath = null) {
    this.logger = new Logger('CostTracker');
    this.storagePath = storagePath || path.join(process.env.HOME, '.pbs-core', 'cost-tracking.json');
    
    // Ensure storage directory exists
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.data = this.load();
    
    // Configuration
    this.thresholds = {
      dailyAlert: 50.00,       // Alert if daily cost > $50
      monthlyAlert: 1000.00,   // Alert if monthly cost > $1000
      requestAlert: 0.050      // Alert if single request > $0.050
    };

    this.alerts = [];
  }

  /**
   * Load cost data from storage
   */
  load() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      this.logger.warn(`Failed to load cost data: ${err.message}`);
    }

    // Initialize empty structure
    return {
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      sessions: {},
      daily: {}, // YYYY-MM-DD → { cost, requestCount }
      monthly: {}, // YYYY-MM → { cost, requestCount }
      byTaskType: {},
      byModel: {},
      totalRequests: 0,
      totalCost: 0
    };
  }

  /**
   * Save cost data to storage
   */
  save() {
    try {
      fs.writeFileSync(this.storagePath, JSON.stringify(this.data, null, 2));
    } catch (err) {
      this.logger.error(`Failed to save cost data: ${err.message}`);
    }
  }

  /**
   * Record a single request's cost
   */
  recordRequest(sessionId, taskType, model, inputTokens, outputTokens, costUSD) {
    const timestamp = new Date();
    const dateStr = this.formatDate(timestamp);
    const monthStr = this.formatMonth(timestamp);

    // Initialize session if needed
    if (!this.data.sessions[sessionId]) {
      this.data.sessions[sessionId] = {
        sessionId,
        startTime: timestamp.toISOString(),
        requests: [],
        totalCost: 0,
        totalRequests: 0,
        byTaskType: {},
        byModel: {}
      };
    }

    const session = this.data.sessions[sessionId];
    
    // Record request
    const request = {
      taskType,
      model,
      inputTokens,
      outputTokens,
      cost: costUSD,
      timestamp: timestamp.toISOString()
    };
    
    session.requests.push(request);
    session.totalCost += costUSD;
    session.totalRequests++;
    session.byTaskType[taskType] = (session.byTaskType[taskType] || 0) + costUSD;
    session.byModel[model] = (session.byModel[model] || 0) + costUSD;

    // Daily tracking
    if (!this.data.daily[dateStr]) {
      this.data.daily[dateStr] = { cost: 0, requestCount: 0 };
    }
    this.data.daily[dateStr].cost += costUSD;
    this.data.daily[dateStr].requestCount++;

    // Monthly tracking
    if (!this.data.monthly[monthStr]) {
      this.data.monthly[monthStr] = { cost: 0, requestCount: 0 };
    }
    this.data.monthly[monthStr].cost += costUSD;
    this.data.monthly[monthStr].requestCount++;

    // By task type
    if (!this.data.byTaskType[taskType]) {
      this.data.byTaskType[taskType] = { cost: 0, requestCount: 0 };
    }
    this.data.byTaskType[taskType].cost += costUSD;
    this.data.byTaskType[taskType].requestCount++;

    // By model
    if (!this.data.byModel[model]) {
      this.data.byModel[model] = { cost: 0, requestCount: 0 };
    }
    this.data.byModel[model].cost += costUSD;
    this.data.byModel[model].requestCount++;

    // Totals
    this.data.totalRequests++;
    this.data.totalCost += costUSD;
    this.data.lastUpdated = timestamp.toISOString();

    // Check thresholds
    this.checkAlerts(costUSD, dateStr, monthStr);

    this.save();

    return request;
  }

  /**
   * Check cost thresholds and generate alerts
   */
  checkAlerts(costUSD, dateStr, monthStr) {
    // Per-request alert
    if (costUSD > this.thresholds.requestAlert) {
      this.createAlert(
        'REQUEST_THRESHOLD',
        `Single request exceeded alert threshold: $${costUSD.toFixed(4)} > $${this.thresholds.requestAlert}`,
        'warning'
      );
    }

    // Daily alert
    const dailyCost = this.data.daily[dateStr].cost;
    if (dailyCost > this.thresholds.dailyAlert) {
      this.createAlert(
        'DAILY_THRESHOLD',
        `Daily cost exceeded alert threshold: $${dailyCost.toFixed(2)} > $${this.thresholds.dailyAlert} on ${dateStr}`,
        'warning'
      );
    }

    // Monthly alert
    const monthlyCost = this.data.monthly[monthStr].cost;
    if (monthlyCost > this.thresholds.monthlyAlert) {
      this.createAlert(
        'MONTHLY_THRESHOLD',
        `Monthly cost exceeded alert threshold: $${monthlyCost.toFixed(2)} > $${this.thresholds.monthlyAlert} in ${monthStr}`,
        'critical'
      );
    }
  }

  /**
   * Create an alert
   */
  createAlert(type, message, level = 'warning') {
    const alert = {
      type,
      message,
      level,
      timestamp: new Date().toISOString()
    };
    
    this.alerts.push(alert);
    this.logger.warn(`🚨 ALERT [${level.toUpperCase()}]: ${message}`);
    
    return alert;
  }

  /**
   * Get session cost summary
   */
  getSessionCost(sessionId) {
    return this.data.sessions[sessionId];
  }

  /**
   * Get daily cost summary
   */
  getDailyCost(dateStr) {
    return this.data.daily[dateStr];
  }

  /**
   * Get monthly cost summary
   */
  getMonthlyCost(monthStr) {
    return this.data.monthly[monthStr];
  }

  /**
   * Get cost breakdown by task type
   */
  getCostByTaskType() {
    return this.data.byTaskType;
  }

  /**
   * Get cost breakdown by model
   */
  getCostByModel() {
    return this.data.byModel;
  }

  /**
   * Calculate savings vs baseline (Claude Opus everywhere)
   */
  calculateSavings() {
    // Baseline: all requests at Claude Opus cost ($0.015/request)
    const opusCostPerRequest = 0.015;
    const baselineCost = this.data.totalRequests * opusCostPerRequest;
    const savedAmount = baselineCost - this.data.totalCost;
    const savingsPercent = (savedAmount / baselineCost) * 100;

    return {
      baselineCost: baselineCost.toFixed(2),
      actualCost: this.data.totalCost.toFixed(2),
      savedAmount: savedAmount.toFixed(2),
      savingsPercent: savingsPercent.toFixed(2),
      requestCount: this.data.totalRequests,
      averageBaseline: opusCostPerRequest.toFixed(4),
      averageActual: (this.data.totalCost / this.data.totalRequests).toFixed(4)
    };
  }

  /**
   * Get complete dashboard report
   */
  getDashboard() {
    const dateStr = this.formatDate(new Date());
    const monthStr = this.formatMonth(new Date());

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: this.data.totalRequests,
        totalCost: this.data.totalCost.toFixed(2),
        averageCostPerRequest: (this.data.totalCost / this.data.totalRequests).toFixed(4),
        todayCost: this.data.daily[dateStr]?.cost?.toFixed(2) || '0.00',
        todayRequests: this.data.daily[dateStr]?.requestCount || 0,
        monthCost: this.data.monthly[monthStr]?.cost?.toFixed(2) || '0.00',
        monthRequests: this.data.monthly[monthStr]?.requestCount || 0
      },
      savings: this.calculateSavings(),
      byTaskType: this.data.byTaskType,
      byModel: this.data.byModel,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      thresholds: this.thresholds
    };
  }

  /**
   * Get recent requests (for live tracking)
   */
  getRecentRequests(sessionId = null, limit = 20) {
    let requests = [];

    if (sessionId && this.data.sessions[sessionId]) {
      requests = this.data.sessions[sessionId].requests;
    } else {
      // Flatten all requests from all sessions
      for (const session of Object.values(this.data.sessions)) {
        requests.push(...session.requests);
      }
    }

    // Sort by timestamp descending and return latest
    return requests
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Export data for external analysis
   */
  exportData(format = 'json') {
    if (format === 'csv') {
      return this.exportAsCSV();
    }
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Export as CSV
   */
  exportAsCSV() {
    const rows = ['Date,SessionId,TaskType,Model,InputTokens,OutputTokens,Cost'];

    for (const [sessionId, session] of Object.entries(this.data.sessions)) {
      for (const request of session.requests) {
        const date = request.timestamp.split('T')[0];
        rows.push(
          `${date},${sessionId},${request.taskType},${request.model},${request.inputTokens},${request.outputTokens},${request.cost}`
        );
      }
    }

    return rows.join('\n');
  }

  /**
   * Clear old data (older than N days)
   */
  clearOldData(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedSessions = 0;
    for (const [sessionId, session] of Object.entries(this.data.sessions)) {
      if (new Date(session.startTime) < cutoffDate) {
        delete this.data.sessions[sessionId];
        deletedSessions++;
      }
    }

    this.logger.info(`Cleaned up ${deletedSessions} old sessions`);
    this.save();
  }

  /**
   * Helper: format date as YYYY-MM-DD
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: format month as YYYY-MM
   */
  formatMonth(date) {
    return date.toISOString().substring(0, 7);
  }

  /**
   * Set alert threshold
   */
  setThreshold(type, value) {
    if (type === 'daily' || type === 'dailyAlert') {
      this.thresholds.dailyAlert = value;
    } else if (type === 'monthly' || type === 'monthlyAlert') {
      this.thresholds.monthlyAlert = value;
    } else if (type === 'request' || type === 'requestAlert') {
      this.thresholds.requestAlert = value;
    }
  }

  /**
   * Get all alerts
   */
  getAlerts() {
    return this.alerts;
  }

  /**
   * Clear alerts
   */
  clearAlerts() {
    this.alerts = [];
  }
}

module.exports = { CostTracker };
