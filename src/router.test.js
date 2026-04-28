/**
 * Tests for ClawRouter Integration
 * 15 tests covering routing, cost tracking, debate, and C-Level logic
 */

const { RouterConfig } = require('./router-config');
const { CostTracker } = require('./cost-tracker');
const { ClawRouterIntegration } = require('./clawrouter-integration');
const { DebateConsensusEngine } = require('./debate-consensus');
const { CLevelRouter } = require('./c-level-router');

// Mock ClawRouter client
class MockClawRouterClient {
  async chat() {
    return {
      completions: {
        create: async (payload) => ({
          choices: [{ message: { content: '{"recommendation": "approve", "reasoning": "Test approval", "score": 85}' } }],
          usage: { completion_tokens: 100, prompt_tokens: 50 },
          model: payload.model
        })
      }
    };
  }
}

describe('ClawRouter Integration Tests', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new MockClawRouterClient();
  });

  // TEST 1: Task Classification
  test('TEST 1: Classifies debate tasks correctly', () => {
    const config = new RouterConfig(mockClient);
    
    const debateTask = {
      title: 'Product debate',
      description: 'Should we launch this consensus feature?'
    };
    
    const taskType = config.classifyTask(debateTask);
    expect(taskType).toBe('debate');
  });

  // TEST 2: Task Classification - Simple
  test('TEST 2: Classifies simple tasks correctly', () => {
    const config = new RouterConfig(mockClient);
    
    const simpleTask = {
      title: 'Format response',
      description: 'Please format this as JSON'
    };
    
    const taskType = config.classifyTask(simpleTask);
    expect(taskType).toBe('simple');
  });

  // TEST 3: Task Classification - C-Level
  test('TEST 3: Classifies C-Level tasks correctly', () => {
    const config = new RouterConfig(mockClient);
    
    const cLevelTask = {
      title: 'CEO decision',
      description: 'Strategic direction for Q2'
    };
    
    const taskType = config.classifyTask(cLevelTask);
    expect(taskType).toBe('clevel');
  });

  // TEST 4: Payload building
  test('TEST 4: Builds correct LLM payload', () => {
    const config = new RouterConfig(mockClient);
    const profile = config.profiles.debate;
    
    const task = {
      id: 'test-task',
      prompt: 'Test prompt',
      messages: [{ role: 'user', content: 'Test' }]
    };
    
    const payload = config.buildPayload(task, profile, { sessionId: 'test-session' });
    
    expect(payload.model).toBe('blockrun/auto');
    expect(payload.messages).toBeDefined();
    expect(payload.metadata.taskId).toBe('test-task');
    expect(payload.metadata.sessionId).toBe('test-session');
  });

  // TEST 5: Cost tracking for single request
  test('TEST 5: Tracks cost for single request', () => {
    const config = new RouterConfig(mockClient);
    
    config.trackCost('session-1', 'gpt-4o', 100, 100, 0.0063);
    const sessionCosts = config.getSessionCosts('session-1');
    
    expect(sessionCosts.totalCost).toBe(0.0063);
    expect(sessionCosts.requestCount).toBe(1);
  });

  // TEST 6: Cost tracking - multiple requests
  test('TEST 6: Tracks cost for multiple requests', () => {
    const config = new RouterConfig(mockClient);
    
    config.trackCost('session-1', 'gpt-4o', 100, 100, 0.0063);
    config.trackCost('session-1', 'claude-haiku', 100, 100, 0.0030);
    config.trackCost('session-1', 'gpt-4o-mini', 50, 50, 0.0004);
    
    const sessionCosts = config.getSessionCosts('session-1');
    const total = (0.0063 + 0.0030 + 0.0004);
    
    expect(sessionCosts.totalCost).toBeCloseTo(total, 4);
    expect(sessionCosts.requestCount).toBe(3);
  });

  // TEST 7: Cost savings calculation
  test('TEST 7: Calculates cost savings vs baseline', () => {
    const config = new RouterConfig(mockClient);
    
    config.trackCost('session-1', 'gpt-4o-mini', 100, 100, 0.0004);
    config.trackCost('session-1', 'gemini-flash', 100, 100, 0.0014);
    
    const sessionCosts = config.getSessionCosts('session-1');
    const savings = config.calculateSavings(sessionCosts);
    
    // Baseline: 2 requests * $0.015 = $0.030
    // Actual: $0.0004 + $0.0014 = $0.0018
    expect(savings.baselineCost).toEqual('0.0300');
    expect(parseFloat(savings.savedAmount)).toBeGreaterThan(0);
    expect(parseFloat(savings.savingsPercent)).toBeGreaterThan(90);
  });

  // TEST 8: Cost limits enforcement
  test('TEST 8: Validates cost limits', () => {
    const config = new RouterConfig(mockClient);
    config.costLimits.perSession = 1.00; // $1.00 limit
    
    // This should succeed
    config.trackCost('session-1', 'gpt-4o', 100, 100, 0.50);
    expect(config.getSessionCosts('session-1').totalCost).toBe(0.50);
    
    // This should trigger warning but continue
    config.trackCost('session-1', 'gpt-4o', 100, 100, 0.60);
    expect(config.getSessionCosts('session-1').totalCost).toBe(1.10);
  });

  // TEST 9: Cost Tracker - Session isolation
  test('TEST 9: Isolates costs per session', () => {
    const tracker = new CostTracker();
    
    tracker.recordRequest('session-1', 'debate', 'gpt-4o', 100, 100, 0.0063);
    tracker.recordRequest('session-2', 'clevel', 'claude-opus', 100, 100, 0.0150);
    
    const session1 = tracker.getSessionCost('session-1');
    const session2 = tracker.getSessionCost('session-2');
    
    expect(session1.totalCost).toBe(0.0063);
    expect(session2.totalCost).toBe(0.0150);
    expect(session1.requests[0].taskType).toBe('debate');
    expect(session2.requests[0].taskType).toBe('clevel');
  });

  // TEST 10: Cost Tracker - Alerts
  test('TEST 10: Generates alerts for high costs', () => {
    const tracker = new CostTracker();
    tracker.setThreshold('request', 0.010);
    
    tracker.recordRequest('session-1', 'task', 'expensive-model', 100, 200, 0.050);
    
    const alerts = tracker.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].type).toBe('REQUEST_THRESHOLD');
  });

  // TEST 11: Debate consensus calculation
  test('TEST 11: Calculates debate consensus correctly', () => {
    const debate = new DebateConsensusEngine();
    
    const resultsMap = {
      claude: { recommendation: 'approve', score: 90 },
      grok: { recommendation: 'approve', score: 85 },
      gemini: { recommendation: 'approve', score: 88 },
      anthropic: { recommendation: 'approve', score: 92 }
    };
    
    const consensus = debate.calculateConsensus(resultsMap);
    
    expect(consensus.level).toBe('STRONG');
    expect(consensus.agreementCount).toBe(4);
    expect(consensus.votes.approve).toBe(4);
  });

  // TEST 12: Debate consensus - NO_CONSENSUS scenario
  test('TEST 12: Detects NO_CONSENSUS in debate', () => {
    const debate = new DebateConsensusEngine();
    
    const resultsMap = {
      claude: { recommendation: 'approve', score: 90 },
      grok: { recommendation: 'approve', score: 85 },
      gemini: { recommendation: 'reject', score: 60 },
      anthropic: { recommendation: 'reject', score: 55 }
    };
    
    const consensus = debate.calculateConsensus(resultsMap);
    
    expect(consensus.level).toBe('NO_CONSENSUS');
    expect(consensus.votes.approve).toBe(2);
    expect(consensus.votes.reject).toBe(2);
  });

  // TEST 13: Weak engine identification
  test('TEST 13: Identifies weak engines in debate', () => {
    const clevel = new CLevelRouter();
    
    const debateResults = {
      claude: { recommendation: 'approve', score: 90 },
      grok: { recommendation: 'approve', score: 85 },
      gemini: { recommendation: 'reject', score: 60 },
      anthropic: { recommendation: 'reject', score: 55 }
    };
    
    const weakEngines = clevel.identifyWeakEngines(debateResults);
    
    // Majority is approve (2 vs 2), so identifyWeakEngines should find the minority
    expect(weakEngines.length).toBeGreaterThan(0);
  });

  // TEST 14: ClawRouter integration initialization
  test('TEST 14: Initializes ClawRouter integration', () => {
    const integration = new ClawRouterIntegration(mockClient, { sessionId: 'test-session' });
    
    expect(integration.sessionId).toBe('test-session');
    expect(integration.costTracker).toBeDefined();
    expect(integration.routerConfig).toBeDefined();
  });

  // TEST 15: Export cost data
  test('TEST 15: Exports cost data in multiple formats', () => {
    const tracker = new CostTracker();
    
    tracker.recordRequest('session-1', 'debate', 'gpt-4o', 100, 100, 0.0063);
    tracker.recordRequest('session-1', 'debate', 'claude-opus', 100, 100, 0.0150);
    
    const jsonData = tracker.exportData('json');
    expect(jsonData).toContain('"sessionId"');
    
    const csvData = tracker.exportData('csv');
    expect(csvData).toContain('Date,SessionId');
    expect(csvData).toContain('debate');
  });
});

// Integration test helpers
function createMockTask(id, type = 'simple') {
  return {
    id: id || `task-${Date.now()}`,
    title: `Test ${type} task`,
    description: `This is a test ${type} task`,
    prompt: 'Please analyze this task.',
    type: type
  };
}

function createMockDebateResults() {
  return {
    consensus: {
      level: 'CONSENSUS',
      agreementCount: 3,
      votes: { approve: 3, reject: 1, abstain: 0 },
      recommendation: 'proceed',
      confidence: 75
    },
    results: {
      claude: { recommendation: 'approve', reasoning: 'Strong case', score: 92 },
      grok: { recommendation: 'approve', reasoning: 'Solid plan', score: 88 },
      gemini: { recommendation: 'approve', reasoning: 'Good timing', score: 85 },
      anthropic: { recommendation: 'reject', reasoning: 'Risk concern', score: 40 }
    }
  };
}

module.exports = {
  createMockTask,
  createMockDebateResults
};
