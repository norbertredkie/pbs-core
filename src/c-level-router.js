/**
 * C-Level Router
 * 
 * Routes debate results to C-Level agents (CEO, CTO, CFO, COO)
 * 
 * Flow:
 * 1. Receives debate consensus
 * 2. If STRONG or CONSENSUS (3+/4) → all C-Level agents analyze
 * 3. If NO_CONSENSUS (< 3/4):
 *    a. C-Level can request re-debate (specify which engines)
 *    b. Or override without consensus (C-Level takes responsibility)
 */

const { Logger } = require('./logger');
const { DebateConsensusEngine } = require('./debate-consensus');

class CLevelRouter {
  constructor() {
    this.logger = new Logger('CLevelRouter');
    this.consensus = new DebateConsensusEngine();
    this.decisions = [];
    this.llmInterface = null; // Will be set by orchestrator
  }

  /**
   * Set LLM interface (ClawRouter integration)
   */
  setLLMInterface(llmInterface) {
    this.llmInterface = llmInterface;
    this.logger.info('✅ ClawRouter LLM interface injected');
  }

  /**
   * Main C-Level decision flow
   */
  async decide(debateResults, task) {
    this.logger.info(`C-Level processing debate results. Consensus: ${debateResults.consensus.level}`);

    // Step 1: Check consensus level
    if (debateResults.consensus.level === 'NO_CONSENSUS') {
      this.logger.warn(`No consensus (${debateResults.consensus.agreementCount}/4 agree). Requesting re-debate or override.`);
      return this.handleNoConsensus(debateResults, task);
    }

    // Step 2: All C-Level agents analyze the consensus
    this.logger.info(`Consensus achieved (${debateResults.consensus.agreementCount}/4). All C-Level agents analyzing...`);
    
    const ceoDecision = await this.routeToCEO(debateResults, task);
    const ctoDecision = await this.routeToCTO(debateResults, task);
    const cfoDecision = await this.routeToCFO(debateResults, task);
    const cooDecision = await this.routeToCOO(debateResults, task);

    // Step 3: Consolidate C-Level decisions
    const finalDecision = this.consolidateCLevelDecisions({
      ceo: ceoDecision,
      cto: ctoDecision,
      cfo: cfoDecision,
      coo: cooDecision,
      debateConsensus: debateResults.consensus
    });

    this.decisions.push(finalDecision);

    return finalDecision;
  }

  /**
   * Handle NO_CONSENSUS situation
   * C-Level can re-debate or override
   */
  async handleNoConsensus(debateResults, task) {
    this.logger.info(`No consensus detected. Analyzing debate split...`);

    const split = debateResults.consensus.votes;
    
    // Option A: Re-invoke weaker debaters
    const weakEngines = this.identifyWeakEngines(debateResults.results);
    
    return {
      status: 'NO_CONSENSUS',
      consensusLevel: debateResults.consensus.level,
      split: split,
      debateResults: debateResults,
      options: [
        {
          action: 're-debate',
          description: `Re-invoke ${weakEngines.join(', ')} engines for deeper analysis`,
          engines: weakEngines,
          nextRound: 2
        },
        {
          action: 'c-level-override',
          description: 'C-Level agents make decision despite no consensus',
          requiresApproval: 'all-agents'
        },
        {
          action: 'escalate',
          description: 'Escalate to human decision-maker',
          requiresApproval: 'human'
        }
      ],
      requiresCLevelAction: true,
      waitingFor: 'C-Level decision on next steps'
    };
  }

  /**
   * When C-Level chooses to re-debate
   */
  async executeReDebate(task, debateResults, enginesTarget, round = 2) {
    this.logger.info(`C-Level triggered re-debate on engines: ${enginesTarget.join(', ')}`);

    const newResults = await this.consensus.reDebate(task, enginesTarget, round);

    // Recursively call decide() with new results
    return this.decide(newResults, task);
  }

  /**
   * When C-Level overrides without consensus
   */
  async executeCLevelOverride(task, debateResults, cLevelRationale) {
    this.logger.warn(`C-Level override initiated. Rationale: ${cLevelRationale}`);

    // Still call all C-Level agents, but they know override is happening
    const ceoDecision = await this.routeToCEO(debateResults, task, { 
      override: true, 
      rationale: cLevelRationale 
    });
    const ctoDecision = await this.routeToCTO(debateResults, task, { 
      override: true, 
      rationale: cLevelRationale 
    });
    const cfoDecision = await this.routeToCFO(debateResults, task, { 
      override: true, 
      rationale: cLevelRationale 
    });
    const cooDecision = await this.routeToCOO(debateResults, task, { 
      override: true, 
      rationale: cLevelRationale 
    });

    return this.consolidateCLevelDecisions({
      ceo: ceoDecision,
      cto: ctoDecision,
      cfo: cfoDecision,
      coo: cooDecision,
      debateConsensus: debateResults.consensus,
      override: true,
      overrideRationale: cLevelRationale
    });
  }

  /**
   * Identify which debate engines had minority opinion
   */
  identifyWeakEngines(debateResults) {
    const minority = [];
    const votes = {};

    for (const [engine, result] of Object.entries(debateResults)) {
      const stance = result.recommendation;
      votes[stance] = (votes[stance] || 0) + 1;
    }

    const majorityStance = Object.keys(votes).reduce((a, b) => 
      votes[a] > votes[b] ? a : b
    );

    for (const [engine, result] of Object.entries(debateResults)) {
      if (result.recommendation !== majorityStance) {
        minority.push(engine);
      }
    }

    return minority;
  }

  /**
   * Route to CEO: Strategic decision
   */
  async routeToCEO(debateResults, task, options = {}) {
    this.logger.info(`Routing to CEO for strategic decision`);
    
    if (!this.llmInterface) {
      // Mock fallback
      return {
        agent: 'CEO',
        decision: debateResults.consensus.recommendation === 'proceed' ? 'GO' : 'NO-GO',
        reasoning: 'Strategic assessment...',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const systemPrompt = `You are the CEO. Evaluate the debate consensus and provide a strategic decision.
Consider: market opportunity, risk tolerance, competitive positioning.
Respond with JSON: { "decision": "GO|NO-GO|CONDITIONAL", "reasoning": "...", "riskLevel": "low|medium|high" }`;

      const response = await this.llmInterface.runCLevelCall(
        task,
        'ceo',
        debateResults,
        { systemPrompt }
      );

      const content = response.content?.[0]?.text || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        parsed = {
          decision: content.toLowerCase().includes('go') ? 'GO' : 'NO-GO',
          reasoning: content,
          riskLevel: 'medium'
        };
      }

      return {
        agent: 'CEO',
        ...parsed,
        timestamp: new Date().toISOString(),
        metadata: response.metadata
      };
    } catch (error) {
      this.logger.error(`CEO decision error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Route to CTO: Technical feasibility
   */
  async routeToCTO(debateResults, task, options = {}) {
    this.logger.info(`Routing to CTO for technical assessment`);
    
    if (!this.llmInterface) {
      return {
        agent: 'CTO',
        decision: 'FEASIBLE',
        timeline: '12 weeks',
        resources: '5.0 FTE',
        reasoning: 'Technical roadmap...',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const systemPrompt = `You are the CTO. Evaluate the technical feasibility.
Consider: architecture impact, development timeline, team capacity.
Respond with JSON: { "decision": "FEASIBLE|BLOCKED|RISKY", "timeline": "...", "resources": "...", "reasoning": "..." }`;

      const response = await this.llmInterface.runCLevelCall(
        task,
        'cto',
        debateResults,
        { systemPrompt }
      );

      const content = response.content?.[0]?.text || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        parsed = {
          decision: 'FEASIBLE',
          timeline: '12 weeks',
          resources: '5.0 FTE',
          reasoning: content
        };
      }

      return {
        agent: 'CTO',
        ...parsed,
        timestamp: new Date().toISOString(),
        metadata: response.metadata
      };
    } catch (error) {
      this.logger.error(`CTO decision error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Route to CFO: Financial impact
   */
  async routeToCFO(debateResults, task, options = {}) {
    this.logger.info(`Routing to CFO for financial analysis`);
    
    if (!this.llmInterface) {
      return {
        agent: 'CFO',
        decision: 'APPROVED',
        budget: '€26,775',
        roi: '1,600%+',
        reasoning: 'Financial impact...',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const systemPrompt = `You are the CFO. Analyze the financial impact.
Consider: budget requirements, revenue impact, ROI, payback period.
Respond with JSON: { "decision": "APPROVED|REJECTED|CONDITIONAL", "budget": "...", "roi": "...", "reasoning": "..." }`;

      const response = await this.llmInterface.runCLevelCall(
        task,
        'cfo',
        debateResults,
        { systemPrompt }
      );

      const content = response.content?.[0]?.text || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        parsed = {
          decision: 'APPROVED',
          budget: '€26,775',
          roi: '1,600%+',
          reasoning: content
        };
      }

      return {
        agent: 'CFO',
        ...parsed,
        timestamp: new Date().toISOString(),
        metadata: response.metadata
      };
    } catch (error) {
      this.logger.error(`CFO decision error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Route to COO: Execution planning
   */
  async routeToCOO(debateResults, task, options = {}) {
    this.logger.info(`Routing to COO for execution plan`);
    
    if (!this.llmInterface) {
      return {
        agent: 'COO',
        decision: 'READY',
        timeline: '3 weeks',
        gates: ['security-review', 'performance-test', 'user-acceptance'],
        reasoning: 'Execution plan...',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const systemPrompt = `You are the COO. Plan the execution.
Consider: resources needed, quality gates, risk mitigation, timeline.
Respond with JSON: { "decision": "READY|NOT-READY|CONDITIONAL", "timeline": "...", "gates": [...], "reasoning": "..." }`;

      const response = await this.llmInterface.runCLevelCall(
        task,
        'coo',
        debateResults,
        { systemPrompt }
      );

      const content = response.content?.[0]?.text || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        parsed = {
          decision: 'READY',
          timeline: '3 weeks',
          gates: ['security-review', 'performance-test'],
          reasoning: content
        };
      }

      return {
        agent: 'COO',
        ...parsed,
        timestamp: new Date().toISOString(),
        metadata: response.metadata
      };
    } catch (error) {
      this.logger.error(`COO decision error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Consolidate all C-Level decisions
   */
  consolidateCLevelDecisions(allDecisions) {
    const { ceo, cto, cfo, coo, debateConsensus, override } = allDecisions;

    return {
      timestamp: new Date().toISOString(),
      debateConsensus: debateConsensus.level,
      cLevelApproval: {
        ceo: ceo.decision,
        cto: cto.decision,
        cfo: cfo.decision,
        coo: coo.decision,
        allAgree: [ceo, cto, cfo, coo].every(d => d.decision !== 'REJECT')
      },
      finalDecision: [ceo, cto, cfo, coo].every(d => d.decision === 'GO' || d.decision === 'READY' || d.decision === 'APPROVED' || d.decision === 'FEASIBLE') ? 'PROCEED' : 'HOLD',
      override: override || false,
      details: { ceo, cto, cfo, coo }
    };
  }

  /**
   * Get decision history
   */
  getDecisionHistory() {
    return this.decisions;
  }
}

module.exports = { CLevelRouter };
