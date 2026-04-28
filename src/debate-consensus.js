/**
 * Debate Consensus Engine
 * 
 * Manages 4-model debates and re-invocation logic
 * 
 * Consensus rules:
 * - 4/4 agree → STRONG consensus (execute immediately)
 * - 3/4 agree → CONSENSUS (execute with caution)
 * - 2/2 split → NO CONSENSUS (C-Level decides re-debate or override)
 * - 1/4 agree → WEAK consensus (C-Level must override)
 */

const { Logger } = require('./logger');

class DebateConsensusEngine {
  constructor() {
    this.logger = new Logger('DebateConsensus');
    this.debateHistory = [];
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
   * Run all 4 debates in parallel
   */
  async runAllDebates(task, options = {}) {
    this.logger.info(`Starting 4-model debate for task: ${task.id}`);
    
    const debates = {
      claude: this.runDebate('claude', task),
      grok: this.runDebate('grok', task),
      gemini: this.runDebate('gemini', task),
      anthropic: this.runDebate('anthropic', task)
    };

    const results = await Promise.all(Object.values(debates));
    const resultsMap = {
      claude: results[0],
      grok: results[1],
      gemini: results[2],
      anthropic: results[3]
    };

    // Calculate consensus
    const consensus = this.calculateConsensus(resultsMap);
    
    // Log debate round
    this.debateHistory.push({
      taskId: task.id,
      round: 1,
      timestamp: new Date().toISOString(),
      results: resultsMap,
      consensus: consensus
    });

    this.logger.info(`Debate round 1 complete. Consensus: ${consensus.level} (${consensus.agreementCount}/4)`);

    // If no consensus, return with re-debate option
    if (consensus.level === 'NO_CONSENSUS' && !options.skipReDebate) {
      this.logger.warn(`No consensus detected. C-Level can request re-debate.`);
      return {
        ...consensus,
        results: resultsMap,
        round: 1,
        requiresCLevelDecision: true,
        canReDebate: true
      };
    }

    return {
      ...consensus,
      results: resultsMap,
      round: 1,
      requiresCLevelDecision: consensus.level !== 'STRONG' && consensus.level !== 'CONSENSUS'
    };
  }

  /**
   * Re-invoke specific debates when C-Level decides consensus is needed
   */
  async reDebate(task, debatesToRepeat, round) {
    this.logger.info(`C-Level triggered re-debate (round ${round}) for: ${debatesToRepeat.join(', ')}`);

    const previousRound = this.debateHistory[this.debateHistory.length - 1];
    const debatePromises = {};

    // Only re-run specified debates
    for (const debateName of debatesToRepeat) {
      debatePromises[debateName] = this.runDebate(debateName, task, { 
        context: previousRound.results[debateName],
        round: round 
      });
    }

    // Keep previous results for unchanged debates
    const resultsMap = { ...previousRound.results };
    const newResults = await Promise.all(Object.values(debatePromises));

    let idx = 0;
    for (const debateName of debatesToRepeat) {
      resultsMap[debateName] = newResults[idx++];
    }

    // Recalculate consensus
    const consensus = this.calculateConsensus(resultsMap);

    this.debateHistory.push({
      taskId: task.id,
      round: round,
      timestamp: new Date().toISOString(),
      results: resultsMap,
      consensus: consensus,
      reDebated: debatesToRepeat
    });

    this.logger.info(`Re-debate round ${round} complete. New consensus: ${consensus.level} (${consensus.agreementCount}/4)`);

    return {
      ...consensus,
      results: resultsMap,
      round: round,
      requiresCLevelDecision: consensus.level !== 'STRONG' && consensus.level !== 'CONSENSUS'
    };
  }

  /**
   * C-Level override: make decision without full consensus
   */
  async cLevelOverride(task, debateResults, cLevelDecision) {
    this.logger.info(`C-Level override without consensus. Decision: ${cLevelDecision.action}`);

    return {
      taskId: task.id,
      debateResults: debateResults,
      cLevelOverride: true,
      cLevelDecision: cLevelDecision,
      overrideReason: cLevelDecision.reason,
      consensusWas: debateResults.consensus.level
    };
  }

  /**
   * Calculate consensus from 4 debate results
   */
  calculateConsensus(resultsMap) {
    const votes = {
      approve: 0,
      reject: 0,
      abstain: 0
    };

    // Count votes
    for (const [engine, result] of Object.entries(resultsMap)) {
      const stance = result.recommendation || result.stance;
      if (stance === 'approve' || stance === 'go') {
        votes.approve++;
      } else if (stance === 'reject' || stance === 'no-go') {
        votes.reject++;
      } else {
        votes.abstain++;
      }
    }

    const totalVotes = votes.approve + votes.reject;
    const agreementCount = Math.max(votes.approve, votes.reject);

    // Determine consensus level
    let level = 'NO_CONSENSUS';
    if (agreementCount === 4) {
      level = 'STRONG'; // All 4 agree
    } else if (agreementCount === 3) {
      level = 'CONSENSUS'; // 3 out of 4 agree
    } else if (agreementCount <= 2) {
      level = 'NO_CONSENSUS'; // 2-2 split or worse
    }

    return {
      level,
      agreementCount,
      votes,
      recommendation: votes.approve >= votes.reject ? 'proceed' : 'reconsider',
      confidence: (agreementCount / 4) * 100
    };
  }

  /**
   * Get debate history for task
   */
  getDebateHistory(taskId) {
    return this.debateHistory.filter(record => record.taskId === taskId);
  }

  /**
   * Run debate using ClawRouter for smart LLM routing
   */
  async runDebate(engine, task, options = {}) {
    this.logger.debug(`Running ${engine} debate for ${task.id}${options.round ? ` (round ${options.round})` : ''}`);

    // If no LLM interface, use mock (for backward compatibility)
    if (!this.llmInterface) {
      this.logger.warn(`⚠️ No ClawRouter interface. Using mock implementation...`);
      return {
        engine,
        recommendation: Math.random() > 0.5 ? 'approve' : 'reject',
        reasoning: `${engine} analysis: ...`,
        score: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      };
    }

    try {
      // Call ClawRouter-routed LLM with debate-specific prompt
      const debatePrompt = {
        id: `${task.id}-${engine}`,
        title: `${engine.toUpperCase()} Debate Round ${options.round || 1}`,
        description: task.description || '',
        prompt: `You are the ${engine} debate agent. Analyze this task and provide your recommendation: ${task.prompt || ''}`
      };

      const debateSystemPrompt = `You are the ${engine.toUpperCase()} debate agent. 
Your job is to analyze the given proposal and provide a clear recommendation: "approve" or "reject".
Respond with JSON: { "recommendation": "approve|reject", "reasoning": "...", "score": 0-100 }`;

      const response = await this.llmInterface.runDebateCall(
        debatePrompt,
        engine,
        {
          systemPrompt: debateSystemPrompt,
          temperature: 0.8,
          maxTokens: 500
        }
      );

      // Parse response
      let content = response.content?.[0]?.text || '';
      
      // Try to extract JSON if model wrapped it
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        // Fallback: extract recommendation from text
        const lowerContent = content.toLowerCase();
        const recommendation = lowerContent.includes('approve') || lowerContent.includes('yes') ? 'approve' : 'reject';
        parsed = {
          recommendation,
          reasoning: content,
          score: Math.floor(Math.random() * 100)
        };
      }

      return {
        engine,
        recommendation: parsed.recommendation || 'abstain',
        reasoning: parsed.reasoning || content,
        score: parsed.score || 50,
        timestamp: new Date().toISOString(),
        metadata: response.metadata
      };

    } catch (error) {
      this.logger.error(`Debate error for ${engine}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { DebateConsensusEngine };
