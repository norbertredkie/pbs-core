# PBS Core - Portfolio Orchestrator

Central orchestrator for PBS v5 product portfolio. Routes all decisions through:
1. Debate engines (Claude, Grok, Gemini, Anthropic)
2. C-Level agents (CEO, CTO, CFO, COO)
3. Products (ThreadWizard, WTF Books, FitnessChurn, Arcade.XYZ, Autonomy)

## Architecture

```
PBS Core
├── Router: Directs all tasks
├── Debate Engine: Invokes 4-model consensus
├── C-Level: Strategic decisions based on debates
├── Product Manager: Executes decisions
└── Cross-Interactions: Products talk to each other
```

## Core Workflow

```
Task Input
  ↓
→ Route to Debate Engines (Claude, Grok, Gemini, Anthropic)
  ↓
→ Consolidate debate results
  ↓
→ Send to C-Level (CEO/CTO/CFO/COO)
  ↓
→ C-Level decisions
  ↓
→ Route to Products for implementation
  ↓
→ Products execute + report back
  ↓
→ Cross-interactions trigger if needed
  ↓
Output + Logging
```

## Quick Start

```bash
npm install

# Run debate on code review
node src/debate.js --task="review-threadwizard"

# Get C-Level decision
node src/c-level.js --task="deploy-decision" --input="debate-results.json"

# Execute in product
node src/product-exec.js --product="threadwizard" --decision="fix-auth"
```

## Core Modules

- `debate.js` - Invokes all 4 debate engines
- `c-level.js` - Routes to CEO/CTO/CFO/COO
- `product-exec.js` - Executes decisions in products
- `cross-interact.js` - Handles product-to-product communication
- `logger.js` - Comprehensive logging

## Integration Points

Each debate/C-Level/product is a separate folder:
- `../debates/debate-claude/`
- `../debates/debate-grok/`
- `../c-level/ceo/`
- `../products/threadwizard/`

PBS Core **never duplicates** code - it orchestrates.

## Status

✅ Architecture defined
✅ 5 products ready
✅ 4 debate engines ready
✅ 4 C-Level agents ready
⏳ Integration testing (in progress)

## Team

Built by: Norbert Redkie + OpenClaw AI
