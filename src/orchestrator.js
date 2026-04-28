/**
 * PBS Core Orchestrator
 * 
 * Routes all decisions through:
 * 1. Debate engines (4-model consensus with re-debate logic)
 * 2. C-Level agents (strategic decisions, can request re-debates if consensus < 3/4)
 * 3. Products (implementation)
 * 4. Cross-interactions (product synergies)
 * 
 * RE-DEBATE LOGIC:
 * - If 4/4 agree (STRONG) → execute immediately
 * - If 3/4 agree (CONSENSUS) → execute with caution
 * - If < 3/4 agree (NO_CONSENSUS) → C-Level decides:
 *   a. Re-invoke specific debate engines (e.g., "run claude + grok again")
 *   b. Or override based on C-Level judgment
 *   c. Or escalate to human decision-maker
 */

const path = require('path');
const { DebateConsensusEngine } = require('./debate-consensus');
const { CLevelRouter } = require('./c-level');
const { ProductExecutor } = require('./products');
const { Logger } = require('./logger');
const { ClawRouterIntegration } = require('./clawrouter-integration');

class PBSOrchestrator {
  constructor(clawrouterClient, options = {}) {
    this.logger = new Logger('PBSOrchestrator');
    this.debate = new DebateConsensusEngine();
    this.cLevel = new CLevelRouter();
    this.productExec = new ProductExecutor();
    
    // Initialize ClawRouter integration for smart LLM routing
    this.llm = new ClawRouterIntegration(clawrouterClient, options);
    
    // Inject LLM interface into debate & C-Level engines
    this.debate.setLLMInterface(this.llm);
    this.cLevel.setLLMInterface(this.llm);
    
    this.logger.info(`✅ PBSOrchestrator initialized with ClawRouter smart routing`);
  }

  /**
   * Main orchestration workflow with re-debate logic
   */
  async execute(task, options = {}) {
    this.logger.info(`Starting orchestration for task: ${task.id}`);
    
    try {
      // Step 1: Run 4-model debates
      this.logger.info('Step 1: Running 4-model debate (Claude, Grok, Gemini, Anthropic)...');
      let debateResults = await this.debate.runAllDebates(task);
      this.logger.info(`Debate complete. Consensus: ${debateResults.consensus.level} (${debateResults.consensus.agreementCount}/4 agree)`);

      // Step 1b: If NO_CONSENSUS, C-Level decides on re-debate
      if (debateResults.consensus.level === 'NO_CONSENSUS') {
        this.logger.warn(`No consensus detected. Waiting for C-Level re-debate instruction...`);
        
        // Return to caller for manual decision
        if (options.autoResolveNoConsensus === false) {
          return {
            taskId: task.id,
            status: 'waiting-for-c-level',
            debateResults,
            requiresCLevelDecision: true,
            options: debateResults.options
          };
        }

        // Or auto-resolve: default to re-debate minority engines
        const debatesToRepeat = this.debate.identifyWeakEngines(debateResults.results);
        this.logger.info(`Auto-resolving: Re-invoking ${debatesToRepeat.join(', ')} for consensus...`);
        debateResults = await this.debate.reDebate(task, debatesToRepeat, 2);
      }

      // Step 2: C-Level decision based on debate consensus
      this.logger.info('Step 2: Routing to C-Level (CEO, CTO, CFO, COO)...');
      const cLevelDecision = await this.cLevel.decide(debateResults, task);
      this.logger.info(`C-Level decision: ${cLevelDecision.finalDecision}`);

      // Step 3: Execute in products
      this.logger.info('Step 3: Executing in products...');
      const productResults = await this.productExec.execute(cLevelDecision);
      this.logger.info(`Products executed.`);

      // Step 4: Handle cross-interactions
      if (cLevelDecision.crossInteract) {
        this.logger.info('Step 4: Handling cross-interactions...');
        await this.handleCrossInteractions(productResults);
      }

      // Step 5: Return final result with cost tracking
      const result = {
        taskId: task.id,
        debateResults,
        cLevelDecision,
        productResults,
        status: 'completed',
        timestamp: new Date().toISOString(),
        costTracking: {
          sessionId: this.llm.sessionId,
          totalCost: this.llm.getSessionCosts()?.totalCost || 0,
          requestCount: this.llm.getSessionCosts()?.totalRequests || 0,
          savings: this.llm.getTotalCosts().savings
        }
      };

      this.logger.info(`✅ Orchestration complete. Cost: $${result.costTracking.totalCost?.toFixed(2)}, Savings: ${result.costTracking.savings?.savingsPercent}%`);

      return result;

    } catch (error) {
      this.logger.error(`Orchestration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * C-Level requests re-debate (when consensus < 3/4)
   */
  async requestReDebate(task, debateResults, enginesTarget, options = {}) {
    this.logger.info(`C-Level re-debate request: ${enginesTarget.join(', ')}`);
    
    const newResults = await this.debate.reDebate(task, enginesTarget, 2);
    
    // Recursively process new debate results
    return this.cLevel.decide(newResults, task);
  }

  /**
   * C-Level override (execute without full consensus)
   */
  async cLevelOverride(task, debateResults, cLevelRationale) {
    this.logger.warn(`C-Level override: ${cLevelRationale}`);
    
    const decision = await this.cLevel.executeCLevelOverride(task, debateResults, cLevelRationale);
    
    // Continue with execution
    const productResults = await this.productExec.execute(decision);
    
    return {
      taskId: task.id,
      debateResults,
      cLevelDecision: decision,
      productResults,
      status: 'completed-with-override',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle product-to-product interactions
   */
  async handleCrossInteractions(productResults) {
    // Example: ThreadWizard uses FitnessChurn ML models
    // Example: WTF Books uses Arcade.XYZ game content
    // Example: All products use Autonomy builder for customization

    for (const [product, result] of Object.entries(productResults)) {
      if (result.crossInteractions) {
        for (const interaction of result.crossInteractions) {
          this.logger.info(`Cross-interaction: ${product} → ${interaction.target}`);
          // Execute interaction logic
        }
      }
    }
  }

  /**
   * Get debate results only (no C-Level)
   */
  async getDebateOnly(task) {
    const results = await this.debate.run(task);
    return results;
  }

  /**
   * Get C-Level decision only (no execution)
   */
  async getCLevelOnly(debateResults) {
    const decision = await this.cLevel.decide(debateResults);
    return decision;
  }

  /**
   * Execute directly in product (no debate/C-Level)
   */
  async executeInProduct(product, action) {
    const results = await this.productExec.executeOne(product, action);
    return results;
  }

  /**
   * Print cost dashboard
   */
  printCostDashboard() {
    this.llm.printDashboard();
  }

  /**
   * Get cost summary
   */
  getCostSummary() {
    return this.llm.getTotalCosts();
  }

  /**
   * Export cost data for analysis
   */
  exportCostData(format = 'json') {
    return this.llm.exportCostData(format);
  }

  /**
   * Set cost alert threshold
   */
  setAlertThreshold(type, value) {
    this.llm.setAlertThreshold(type, value);
  }
}

module.exports = { PBSOrchestrator };
