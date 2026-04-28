/**
 * ClawRouter Integration Layer for PBS Core
 * 
 * Wraps ClawRouter client and provides:
 * - Unified LLM interface for all debate & C-Level calls
 * - Cost tracking
 * - Task routing
 * - Error handling & fallback
 */

const { Logger } = require('./logger');
const { RouterConfig } = require('./router-config');
const { CostTracker } = require('./cost-tracker');

class ClawRouterIntegration {
  constructor(clawrouterClient, options = {}) {
    this.logger = new Logger('ClawRouterIntegration');
    this.client = clawrouterClient;
    this.routerConfig = new RouterConfig(clawrouterClient);
    this.costTracker = new CostTracker(options.costTrackerPath);
    this.sessionId = options.sessionId || this.generateSessionId();
    
    this.logger.info(`✅ ClawRouter Integration initialized. Session: ${this.sessionId}`);
  }

  /**
   * Main LLM call interface - used by debate & C-Level engines
   */
  async callLLM(task, options = {}) {
    try {
      // Classify task
      const taskType = this.routerConfig.classifyTask(task);
      const profile = this.routerConfig.getProfile(taskType);

      this.logger.debug(`Task '${task.id}' classified as: ${taskType}, routing to: ${profile.model}`);

      // Build payload
      const payload = this.routerConfig.buildPayload(task, profile, {
        sessionId: this.sessionId,
        systemPrompt: options.systemPrompt,
        temperature: options.temperature,
        maxTokens: options.maxTokens
      });

      // Call ClawRouter
      const startTime = Date.now();
      const response = await this.callClawRouter(payload);
      const elapsed = Date.now() - startTime;

      // Extract tokens & cost
      const inputTokens = payload.messages.reduce((sum, msg) => sum + (msg.content?.length || 0) / 4, 0);
      const outputTokens = response.usage?.completion_tokens || (response.content?.[0]?.text?.length || 0) / 4;
      
      // Estimate cost (will be refined by actual API response)
      const estimatedCost = this.estimateCost(profile.model, inputTokens, outputTokens);

      // Track cost
      const costRecord = this.costTracker.recordRequest(
        this.sessionId,
        taskType,
        profile.model,
        Math.ceil(inputTokens),
        Math.ceil(outputTokens),
        estimatedCost
      );

      this.logger.info(`✅ Request completed (${elapsed}ms): ${profile.model}, cost: $${estimatedCost.toFixed(4)}`);

      return {
        ...response,
        metadata: {
          taskId: task.id,
          taskType,
          model: profile.model,
          inputTokens: Math.ceil(inputTokens),
          outputTokens: Math.ceil(outputTokens),
          cost: estimatedCost,
          elapsed,
          costTracked: true
        }
      };

    } catch (error) {
      this.logger.error(`LLM call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Call ClawRouter API
   */
  async callClawRouter(payload) {
    try {
      // Use blockrun/auto for smart routing
      const response = await this.client.chat.completions.create({
        model: payload.model,
        messages: payload.messages,
        temperature: payload.temperature,
        max_tokens: payload.max_tokens
      });

      return {
        content: [{
          type: 'text',
          text: response.choices[0]?.message?.content || ''
        }],
        usage: response.usage,
        model: response.model
      };

    } catch (error) {
      this.logger.error(`ClawRouter API error: ${error.message}`);
      
      // Fallback to free models if USDC balance is low
      if (error.message.includes('insufficient balance')) {
        this.logger.warn(`⚠️ Low balance. Falling back to free models...`);
        return this.callClawRouter({
          ...payload,
          model: 'nvidia/gpt-oss-120b' // Free fallback
        });
      }

      throw error;
    }
  }

  /**
   * Dedicated method for debate engine calls
   * Routes 4 models for consensus
   */
  async runDebateCall(task, engine, options = {}) {
    const profile = this.routerConfig.profiles.debate;
    
    // Add engine context to system prompt
    const systemPrompt = (options.systemPrompt || '') + 
      `\n\nYou are the ${engine.toUpperCase()} debater. Provide a concise opinion on whether this should proceed.`;

    return this.callLLM(
      {
        ...task,
        id: `${task.id}-${engine}`,
        title: `${engine.toUpperCase()} Debate`
      },
      {
        systemPrompt,
        temperature: options.temperature || 0.8,
        maxTokens: options.maxTokens || 500
      }
    );
  }

  /**
   * Dedicated method for C-Level agent calls
   */
  async runCLevelCall(task, executive, debateResults, options = {}) {
    const executiveConfig = this.routerConfig.profiles.clevel.executives[executive];
    
    if (!executiveConfig) {
      throw new Error(`Unknown executive: ${executive}`);
    }

    const systemPrompt = (options.systemPrompt || '') + 
      `\n\nYou are the ${executive.toUpperCase()}. Your responsibility: ${executiveConfig.responsibility}\n` +
      `Debate consensus was: ${debateResults.consensus.level} (${debateResults.consensus.agreementCount}/4 agree)\n` +
      `Make a strategic decision based on your role.`;

    return this.callLLM(
      {
        ...task,
        id: `${task.id}-${executive}`,
        title: `${executive.toUpperCase()} Decision`
      },
      {
        systemPrompt,
        temperature: options.temperature || 0.9,
        maxTokens: options.maxTokens || 1000
      }
    );
  }

  /**
   * Estimate cost for a model
   */
  estimateCost(model, inputTokens, outputTokens) {
    // Cost per million tokens (approximate pricing)
    const costs = {
      'nvidia/gpt-oss-120b': { input: 0, output: 0 }, // FREE
      'nvidia/gpt-oss-20b': { input: 0, output: 0 },
      'nvidia/deepseek-v3.2': { input: 0, output: 0 },
      'openai/gpt-4o-mini': { input: 0.15, output: 0.60 },
      'openai/gpt-4o': { input: 2.50, output: 10.00 },
      'openai/gpt-5.3': { input: 1.75, output: 14.00 },
      'anthropic/claude-haiku-4.5': { input: 1.00, output: 5.00 },
      'anthropic/claude-sonnet-4.6': { input: 3.00, output: 15.00 },
      'anthropic/claude-opus-4.6': { input: 5.00, output: 25.00 },
      'google/gemini-2.5-flash': { input: 0.30, output: 2.50 },
      'google/gemini-3.1-pro': { input: 2.00, output: 12.00 }
    };

    // Find model pricing (fallback to auto routing)
    let pricing = costs[model];
    if (!pricing) {
      // Default to mid-tier for blockrun/auto
      pricing = costs['openai/gpt-4o'] || { input: 2.50, output: 10.00 };
    }

    // Calculate cost: (tokens / 1M) * cost_per_M
    const inputCost = (inputTokens / 1000000) * pricing.input;
    const outputCost = (outputTokens / 1000000) * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get dashboard report
   */
  getDashboard() {
    return this.costTracker.getDashboard();
  }

  /**
   * Get session costs
   */
  getSessionCosts() {
    return this.costTracker.getSessionCost(this.sessionId);
  }

  /**
   * Get total costs across all sessions
   */
  getTotalCosts() {
    const dashboard = this.getDashboard();
    return {
      totalCost: dashboard.summary.totalCost,
      requestCount: dashboard.summary.totalRequests,
      savings: dashboard.savings,
      byTaskType: dashboard.byTaskType,
      byModel: dashboard.byModel
    };
  }

  /**
   * Export cost data
   */
  exportCostData(format = 'json') {
    return this.costTracker.exportData(format);
  }

  /**
   * Print dashboard to console
   */
  printDashboard() {
    const dashboard = this.getDashboard();

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          ClawRouter Cost Tracking Dashboard               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 SUMMARY (Session: ${this.sessionId})`);
    console.log(`  Total Requests: ${dashboard.summary.totalRequests}`);
    console.log(`  Total Cost: $${dashboard.summary.totalCost}`);
    console.log(`  Avg Cost/Request: $${dashboard.summary.averageCostPerRequest}`);
    console.log(`  Today: $${dashboard.summary.todayCost} (${dashboard.summary.todayRequests} requests)`);
    console.log(`  This Month: $${dashboard.summary.monthCost} (${dashboard.summary.monthRequests} requests)`);

    console.log(`\n💰 SAVINGS`);
    console.log(`  Baseline (Claude Opus everywhere): $${dashboard.savings.baselineCost}`);
    console.log(`  Actual Cost (with ClawRouter): $${dashboard.savings.actualCost}`);
    console.log(`  Saved: $${dashboard.savings.savedAmount} (${dashboard.savings.savingsPercent}%)`);

    console.log(`\n📈 BY TASK TYPE`);
    for (const [taskType, data] of Object.entries(dashboard.byTaskType)) {
      console.log(`  ${taskType}: $${data.cost.toFixed(2)} (${data.requestCount} requests)`);
    }

    console.log(`\n🤖 BY MODEL`);
    for (const [model, data] of Object.entries(dashboard.byModel)) {
      console.log(`  ${model}: $${data.cost.toFixed(2)} (${data.requestCount} requests)`);
    }

    if (dashboard.alerts.length > 0) {
      console.log(`\n⚠️  RECENT ALERTS`);
      for (const alert of dashboard.alerts.slice(0, 5)) {
        console.log(`  [${alert.level.toUpperCase()}] ${alert.message}`);
      }
    }

    console.log('\n');
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `pbs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set cost alert thresholds
   */
  setAlertThreshold(type, value) {
    this.costTracker.setThreshold(type, value);
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.costTracker.clearSession(this.sessionId);
    this.logger.info(`Session ${this.sessionId} cleared`);
  }
}

module.exports = { ClawRouterIntegration };
