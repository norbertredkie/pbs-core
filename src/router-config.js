/**
 * ClawRouter Configuration for PBS Core
 * 
 * Task classification & routing rules:
 * - Simple tasks → cheapest model (GPT-4o-mini, Claude Haiku)
 * - Debate tasks → mid-tier (GPT-4o, Claude Sonnet)
 * - C-Level decisions → best models (GPT-4o, Claude Opus)
 * - Code review → best models
 * - Cost tracking per session + per model
 */

const { Logger } = require('./logger');

class RouterConfig {
  constructor(clawrouterClient) {
    this.logger = new Logger('RouterConfig');
    this.clawRouter = clawrouterClient;
    
    // Routing profiles for different task types
    this.profiles = {
      // SIMPLE: lowest cost, sufficient capability
      simple: {
        model: 'blockrun/auto', // Smart routing within budget tier
        fallbacks: ['nvidia/gpt-oss-120b', 'openai/gpt-4o-mini'],
        costBudget: 0.001, // < $0.001 per request
        taskTypes: ['simple-analysis', 'formatting', 'summarization'],
        timeout: 5000
      },
      
      // DEBATE: balanced cost & quality (4-model consensus)
      debate: {
        model: 'blockrun/auto',
        fallbacks: ['openai/gpt-4o', 'anthropic/claude-sonnet-4.6'],
        costBudget: 0.006, // ~$0.006 per request
        taskTypes: ['debate', 'product-analysis', 'opportunity-research'],
        timeout: 15000,
        notes: 'Used for 4-model debate consensus engine'
      },
      
      // CLEVEL: best models for strategic decisions
      clevel: {
        model: 'blockrun/auto',
        fallbacks: ['openai/gpt-4o', 'anthropic/claude-opus-4.6'],
        costBudget: 0.015, // ~$0.015 per request
        taskTypes: ['c-level-decision', 'strategic-planning', 'risk-assessment'],
        timeout: 20000,
        executives: {
          ceo: {
            model: 'openai/gpt-4o',
            responsibility: 'Strategic vision, business impact'
          },
          cto: {
            model: 'openai/gpt-4o',
            responsibility: 'Technical feasibility, architecture'
          },
          cfo: {
            model: 'anthropic/claude-opus-4.6',
            responsibility: 'Financial impact, ROI, cost-benefit'
          },
          coo: {
            model: 'anthropic/claude-opus-4.6',
            responsibility: 'Operational efficiency, execution risk'
          }
        }
      },
      
      // CODE_REVIEW: best models for quality
      codeReview: {
        model: 'blockrun/auto',
        fallbacks: ['openai/gpt-4o', 'anthropic/claude-opus-4.6'],
        costBudget: 0.015,
        taskTypes: ['code-review', 'security-audit', 'performance-optimization'],
        timeout: 20000
      },
      
      // WEEKLY_RESEARCH: substantial reasoning, mid-tier cost
      weeklyResearch: {
        model: 'blockrun/auto',
        fallbacks: ['openai/gpt-4o', 'anthropic/claude-sonnet-4.6'],
        costBudget: 0.010,
        taskTypes: ['market-research', 'trend-analysis', 'competitor-analysis'],
        timeout: 30000
      }
    };

    // Cost limits
    this.costLimits = {
      perRequest: 0.020, // Max $0.020 per request (safety net)
      perSession: 10.00, // Max $10 per session
      perDay: 100.00,    // Max $100 per day
      perMonth: 1000.00  // Max $1000 per month
    };

    this.sessionCosts = new Map(); // sessionId → { totalCost, requestCount, breakdown: { model: cost } }
  }

  /**
   * Classify task by type and return appropriate routing profile
   */
  classifyTask(task) {
    const keywords = {
      debate: ['debate', 'consensus', 'opinion', 'disagree'],
      clevel: ['c-level', 'ceo', 'cto', 'cfo', 'coo', 'strategic', 'decision'],
      codeReview: ['code-review', 'security', 'audit', 'refactor', 'performance'],
      weeklyResearch: ['market', 'trend', 'research', 'competitor', 'analysis', 'opportunity'],
      simple: ['format', 'summarize', 'extract', 'parse']
    };

    const taskStr = `${task.title || ''} ${task.description || ''}`.toLowerCase();
    
    for (const [type, keys] of Object.entries(keywords)) {
      if (keys.some(k => taskStr.includes(k))) {
        return type === 'codeReview' ? 'codeReview' : type;
      }
    }

    // Default to simple if unclear
    return 'simple';
  }

  /**
   * Get routing profile for task
   */
  getProfile(taskType) {
    return this.profiles[taskType] || this.profiles.simple;
  }

  /**
   * Build LLM call payload for ClawRouter
   */
  buildPayload(task, profile, options = {}) {
    return {
      model: profile.model,
      messages: task.messages || [
        { role: 'system', content: options.systemPrompt || '' },
        { role: 'user', content: task.prompt || '' }
      ],
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      max_tokens: options.maxTokens || 2000,
      timeout: profile.timeout,
      metadata: {
        taskId: task.id,
        taskType: task.type,
        sessionId: options.sessionId,
        timestamp: new Date().toISOString(),
        costTracking: true
      }
    };
  }

  /**
   * Track cost for a single request
   */
  trackCost(sessionId, model, inputTokens, outputTokens, costUSD) {
    if (!this.sessionCosts.has(sessionId)) {
      this.sessionCosts.set(sessionId, {
        sessionId,
        totalCost: 0,
        requestCount: 0,
        breakdown: {},
        requests: []
      });
    }

    const session = this.sessionCosts.get(sessionId);
    session.totalCost += costUSD;
    session.requestCount++;
    session.breakdown[model] = (session.breakdown[model] || 0) + costUSD;
    session.requests.push({
      model,
      inputTokens,
      outputTokens,
      cost: costUSD,
      timestamp: new Date().toISOString()
    });

    // Check limits
    this.validateCostLimits(sessionId, session);

    return session;
  }

  /**
   * Validate against cost limits
   */
  validateCostLimits(sessionId, session) {
    if (session.totalCost > this.costLimits.perSession) {
      this.logger.warn(`⚠️ Session ${sessionId} exceeded per-session limit: $${session.totalCost.toFixed(2)} > $${this.costLimits.perSession}`);
      return false;
    }
    
    return true;
  }

  /**
   * Get session cost summary
   */
  getSessionCosts(sessionId) {
    return this.sessionCosts.get(sessionId);
  }

  /**
   * Get total cost across all sessions
   */
  getTotalCosts() {
    let total = 0;
    let requestCount = 0;
    const breakdown = {};

    for (const session of this.sessionCosts.values()) {
      total += session.totalCost;
      requestCount += session.requestCount;
      
      for (const [model, cost] of Object.entries(session.breakdown)) {
        breakdown[model] = (breakdown[model] || 0) + cost;
      }
    }

    return {
      totalCost: total,
      requestCount,
      breakdown,
      averageCostPerRequest: requestCount > 0 ? total / requestCount : 0
    };
  }

  /**
   * Get cost savings (without vs with ClawRouter)
   */
  calculateSavings(sessionCosts) {
    // Baseline: assume all requests went to Claude Opus at $0.015/request
    const opusCostPerRequest = 0.015;
    const baselineCost = sessionCosts.requestCount * opusCostPerRequest;
    
    const savedAmount = baselineCost - sessionCosts.totalCost;
    const savingsPercent = ((baselineCost - sessionCosts.totalCost) / baselineCost * 100).toFixed(2);

    return {
      baselineCost: baselineCost.toFixed(4),
      actualCost: sessionCosts.totalCost.toFixed(4),
      savedAmount: savedAmount.toFixed(4),
      savingsPercent: `${savingsPercent}%`,
      requestCount: sessionCosts.requestCount
    };
  }

  /**
   * Clear session costs
   */
  clearSession(sessionId) {
    this.sessionCosts.delete(sessionId);
  }

  /**
   * Export cost data for dashboard
   */
  exportCostData() {
    const data = {
      exportDate: new Date().toISOString(),
      sessions: {},
      totals: this.getTotalCosts(),
      limits: this.costLimits
    };

    for (const [sessionId, session] of this.sessionCosts.entries()) {
      data.sessions[sessionId] = {
        ...session,
        savings: this.calculateSavings(session)
      };
    }

    return data;
  }
}

module.exports = { RouterConfig };
