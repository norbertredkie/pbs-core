# PBS Core: Re-Debate Logic

## Overview

When 4-model consensus cannot be reached (fewer than 3/4 models agree), C-Level agents can trigger re-debates to achieve consensus before proceeding.

## Consensus Levels

```
4/4 agree (100%)  → STRONG       ✅ Execute immediately
3/4 agree (75%)   → CONSENSUS    ✅ Execute with caution
2/4 agree (50%)   → NO_CONSENSUS ⚠️  C-Level decides
1/4 agree (25%)   → WEAK         ❌ C-Level must override
```

## Flow Diagram

```
Task Input
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUND 1: DEBATE (4 models in parallel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ├─ Claude (Anthropic)
  ├─ Grok (xAI)
  ├─ Gemini (Google)
  └─ Anthropic (Deep Research)
    ↓
Calculate Consensus
    ↓
┌─────────────────────────────────────────┐
│ Consensus = 3+ models agree?            │
└─────────────────────────────────────────┘
    ↓
    ├─ YES (3-4/4) → STRONG or CONSENSUS
    │   ↓
    │   → Route to C-Level
    │
    └─ NO (0-2/4) → NO_CONSENSUS
        ↓
        C-Level decides:
        ├─ Option A: Re-invoke weaker engines
        │   └─ ROUND 2: Debate (same task, minority engines retry)
        │       ↓
        │       Consensus achieved? → Route to C-Level
        │
        ├─ Option B: Override (C-Level makes final call)
        │   └─ All C-Level agents decide despite no consensus
        │
        └─ Option C: Escalate to human decision-maker
            └─ Manual intervention required
```

## Example: Code Review with No Consensus

```
ROUND 1: Code review of ThreadWizard

Claude:     "Code is UNSAFE - deploy NO-GO" (security issues)
Grok:       "Code is READY - deploy GO" (market pressure)
Gemini:     "Code needs FIXES - deploy CONDITIONAL" (middle ground)
Anthropic:  "Code is SAFE - deploy GO" (comprehensive review)

Votes:
├─ GO: 2 (Grok, Anthropic)
├─ NO-GO: 1 (Claude)
└─ CONDITIONAL: 1 (Gemini)

Consensus: NO_CONSENSUS (2/4 agree on GO, 1 on NO-GO, 1 conditional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C-Level Analysis:

CEO sees: "2 say go, 1 says no-go"
CTO sees: "Security issues + fixes needed"
CFO sees: "Deployment delay costs €10K/day"
COO sees: "Security fixes take 1 week"

C-Level Options:
1. Re-debate: "Claude + Gemini, deeper analysis on security"
2. Override: "Accept risk, deploy with caution"
3. Escalate: "Need human security review"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C-Level chooses: RE-DEBATE with Claude + Gemini

ROUND 2: Security-focused re-debate

Claude:     "With security fixes applied: SAFE - GO"
Gemini:     "Architecture review complete: READY - GO"

New Votes: 4/4 GO (with conditions from Gemini)

Consensus: STRONG (all 4 agree)

→ Route to product execution
```

## API Usage

### Scenario 1: Standard Flow (Auto-Consensus)

```javascript
const orchestrator = new PBSOrchestrator();

const result = await orchestrator.execute(task);
// Handles NO_CONSENSUS automatically by re-debating weak engines
```

### Scenario 2: Manual C-Level Control (No Auto-Resolve)

```javascript
const result = await orchestrator.execute(task, { 
  autoResolveNoConsensus: false 
});

if (result.status === 'waiting-for-c-level') {
  // C-Level chooses next action
  
  // Option A: Re-debate specific engines
  const newResult = await orchestrator.requestReDebate(
    task,
    result.debateResults,
    ['claude', 'gemini']  // Re-invoke these
  );
  
  // Option B: Override
  const overrideResult = await orchestrator.cLevelOverride(
    task,
    result.debateResults,
    "Time-critical deployment, accepting security risks"
  );
}
```

### Scenario 3: C-Level Override Without Re-Debate

```javascript
const result = await orchestrator.cLevelOverride(
  task,
  debateResults,
  "CEO decision: Market opportunity worth risk"
);
// Skips re-debate, executes with C-Level rationale
```

## Re-Debate Strategy

### Which Engines to Re-Invoke?

PBS automatically identifies minority opinion engines:

```javascript
const minority = orchestrator.debate.identifyWeakEngines(
  debateResults.results
);
// Returns: ['claude'] if claude disagreed with 3 others

// Re-invoke minority for deeper analysis
await orchestrator.requestReDebate(task, debateResults, minority);
```

### Re-Debate Context

When re-debating, engines receive:
- Original task
- Previous round analysis (context of why they disagreed)
- Round number (2, 3, etc.)

This helps them refine their analysis rather than repeat.

## Decision Logic Matrix

| Consensus | C-Level Action | Result |
|-----------|---|---|
| 4/4 STRONG | Auto-execute | Proceed immediately |
| 3/4 CONSENSUS | Route to C-Level | All agents review |
| 2/4 NO_CONSENSUS | Re-debate or override | Manual decision required |
| 1/4 WEAK | Override required | C-Level takes responsibility |

## Safety Guarantees

✅ **Consensus always sought first**: No immediate override  
✅ **Minority voice heard**: Re-debates let dissenting engines refine  
✅ **C-Level accountability**: Overrides must include rationale  
✅ **Audit trail**: All rounds logged with timestamps  
✅ **Human escalation**: Path to human decision-maker always available

## Logging & Audit

All debates logged:
```javascript
orchestrator.debate.getDebateHistory(taskId);
// Returns:
// [
//   {
//     taskId: 'review-threadwizard',
//     round: 1,
//     timestamp: '2026-04-27T20:00:00Z',
//     results: { claude: {...}, grok: {...}, gemini: {...}, anthropic: {...} },
//     consensus: { level: 'NO_CONSENSUS', agreementCount: 2, ... }
//   },
//   {
//     taskId: 'review-threadwizard',
//     round: 2,
//     timestamp: '2026-04-27T20:05:00Z',
//     results: { claude: {...}, gemini: {...} },  // only re-debated
//     consensus: { level: 'STRONG', agreementCount: 4, ... },
//     reDebated: ['claude', 'gemini']
//   }
// ]
```

C-Level decisions logged:
```javascript
orchestrator.cLevel.getDecisionHistory();
// Returns all CEO/CTO/CFO/COO decisions with reasoning
```

## Real-World Examples

### Example 1: Code Review
- **Task**: ThreadWizard deployment readiness
- **Debate**: 3 say "ready", 1 says "security issues"
- **C-Level**: "Fix security issues first" 
- **Action**: Route to CTO for 1-week security sprint

### Example 2: Product Launch
- **Task**: FitnessChurn go-to-market decision
- **Debate**: 2 say "go now", 2 say "delay for market research"
- **C-Level**: "Re-debate with real market data"
- **Action**: Grok investigates live market trends, reports

### Example 3: Feature Prioritization
- **Task**: Which product feature to build next?
- **Debate**: "Autonomy first" vs "ThreadWizard first" split
- **C-Level**: "Re-debate focusing on revenue impact"
- **Action**: CFO provides revenue projections for each

## Implementation Status

✅ Debate consensus calculation  
✅ No-consensus detection  
✅ Minority engine identification  
✅ Re-debate routing  
✅ C-Level override mechanism  
✅ Decision logging & audit trail  
⏳ Integration with product executors  
⏳ Human escalation interface
