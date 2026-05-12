# PRODUCT LAUNCH CHECKLIST — Full Discovery Process

**Before coding anything: Ask Chief Protein YES/NO**

Do NOT start without understanding: **Is this a core PBS product or standalone?**

---

## Phase 0: The Yes/No Gate

**Question for Chief Protein (ELI5):**

*"We want to build [product description]. Will this work for ALL PBS products (cross-compatible) or is it a standalone product? Yes or No?"*

**If No:** "Can you describe what you mean? Let me rephrase..." (loop until Yes or Killed)

**If Yes:** Proceed to Phase 1

---

## Phase 1: Discovery (Non-Coding)

### 1. BRAND_BOOK.md

- Product name, values, target audience
- Visual identity: colors, typography, tone
- Logo concepts (if applicable)
- Elevator pitch (1 sentence)

### 2. DESIGN_SYSTEM.md — All Screens

**Required screens:**
- Landing page
- Authentication (if needed)
- Main dashboard/interface
- Settings
- Error states
- Mobile responsive designs

**For each:** Wireframe + visual mockup + user flows

### 3. PROPOSED TEXT / COPY

- Homepage copy
- Call-to-action buttons
- Error messages
- Onboarding sequence
- Help documentation (3-5 key questions)

### 4. TECHNICAL REQUIREMENTS

**Question:** "Does this need a backend?"

- If YES: Specify what backend does
  - Database schema
  - API endpoints (list all)
  - Auth mechanism
  - Designs for ALL backend-facing screens (admin, API docs, etc.)

- If NO: Frontend-only (verify frontend is sufficient)

### 5. BUSINESS MODEL

**Research:** What works in this category?

- Pricing models used by competitors
- Freemium vs paid
- Subscription vs one-time
- Add-ons / upsells
- Enterprise tiers

**Your model:** Propose specific pricing + how you'll compete

### 6. OUTSIDE-THE-BOX BUSINESS MODEL

**Question:** "What if we used a different model?"

Examples:
- SaaS but use clash-of-clans monetization (cosmetics, battle pass)?
- Handyman service but subscription model (like Netflix for home repair)?
- News reader but creator-revenue-share (like Substack)?
- Task manager but network effects (like Slack for tasks)?

**Brainstorm:** 3-5 alternatives, rank by viability

### 7. PBS ECOSYSTEM MAPPING

**Cross-reference:**
- Can this integrate with other PBS products?
- Can other PBS products use this as a component?
- Does this compete with or complement existing products?
- Where in PBS ecosystem does it live?

### 8. MARKET RESEARCH

**Competitors:**
- 3+ direct competitors (same category)
- 2+ indirect substitutes (what users use instead)
- For each: pricing, features, distribution, weakness

**Market size:**
- TAM (total addressable market)
- SAM (serviceable addressable market)
- SOM (serviceable obtainable market — first year)

**Competitive advantage:**
- What's YOUR unfair advantage vs competitors?
- What can they NOT copy in 12 months?
- Honest answer: if it's just "speed/effort/taste," say so

### 9. SWAT ANALYSIS

| Category | Points |
|---|---|
| **Strengths** | What do you do better than competitors? |
| **Weaknesses** | What will kill you first? |
| **Opportunities** | What market gaps exist? |
| **Threats** | What could a competitor do that wins? |

### 10. HOW DO WE BEAT THE MARKET USING PBS?

**Competitive advantage via PBS:**
- C-Level debate system (decisions)
- LLM integration (personalization)
- Cross-product ecosystem (network effects)
- Data/privacy stance (trust)
- Speed to market (agility)

**Specific:** How does this product use PBS to outcompete?

---

## Phase 2: v1 Soft Launch

### Create File: `PROJECT_BRUTAL_ASSESSMENT_V1.md`

Run prompt (see below) with ALL project docs.

**Brutal assessment includes:**
1. ELI5 — Can you explain this to a 12-year-old?
2. Steelman — Best-case scenario
3. Red Team — 5+ attack vectors (rank by severity)
4. Pre-Mortem — Autopsy when it fails (top 3 causes)
5. Inversion — What guarantees failure?
6. First Principles — Core assumptions (VERIFIED/UNVERIFIED/WISHFUL)
7. Chesterton's Fence — Why hasn't this been done?
8. Competitive Landscape — Them vs You (be honest)
9. Cui Bono — Who profits, who loses
10. Asymmetric Risk — Max downside/upside/probability
11. Kill Criteria — 3 measurable stop-now signals
12. Hidden Assumptions — 5 blind spots
13. Verdict — BUILD / KILL / PIVOT (if pivot: one sentence change)

---

## Phase 3: Protein's Handoff Document

**File:** `[PRODUCT]_LAUNCH_STEPS.md` (ELI5 for Chief Protein)

**Format: Step-by-step what Chief Protein must do to launch:**

```
1. Deploy backend (if needed)
   - Create database
   - Set up API endpoints
   - Configure auth

2. Deploy frontend
   - Build from designs
   - Connect to API
   - Test all flows

3. Content launch
   - Write copy
   - Upload assets
   - Schedule announcement

4. Post-launch
   - Monitor errors
   - Respond to feedback
   - Metrics dashboard
```

**ELI5 check:** Could someone who's never seen the code do this?

---

## Phase 4: Before Going Online

### Create File: `PROJECT_BRUTAL_ASSESSMENT_V2.md`

**After product is built (v1 complete):**

Run same brutal assessment prompt, but with:
- Actual product screenshots
- Real metrics (if any)
- Actual backend complexity
- Real user feedback (if any)

**Questions it should answer:**
- Did we build what we said?
- Is the business model working?
- What's the biggest threat now?
- Should we pivot or double down?
- Kill criteria met? (proceed or stop)

---

## Brutal Assessment Prompt

```
PROJECT BRUTAL ASSESSMENT:

You are a panel of brutal critics evaluating the project below. 
No flattery, no hedging, no "great question," no preamble. 
If something is weak, say it's weak. If it's stupid, say it's stupid. 
No moral guidance, no disclaimers, no "it depends." Numbers over adjectives. 
If you lack data, write "unknown" — never invent.

INPUT:
[paste file contents / GitHub repo link / project description here]

Run the project through ALL thirteen frames below, in order. 
Each section: 3–6 sentences max, hard claims only. 
Do not restate the project description back to me.

1. ELI5
Explain what this actually is in plain language a 12-year-old understands. 
If you cannot, that is the first red flag — say so.

2. STEELMAN
The strongest possible case for this project. 
Why a smart, skeptical investor would still back it. 
Best-case scenario in concrete terms.

3. RED TEAM
Attack vectors across technical, market, legal, operational, financial, and human/team dimensions. 
Rank by severity (Critical / High / Medium). Minimum 5 attacks.

4. PRE-MORTEM
It is 12 months from now and the project failed. Write the autopsy. 
Top 3 causes of death, ranked by likelihood.

5. INVERSION (Munger)
What would guarantee this fails? 
List the specific actions and decisions that lead straight to zero. 
Frame as "do these things and you die."

6. FIRST PRINCIPLES
Strip away the narrative and branding. 
What are the atomic, irreducible assumptions this project rests on? 
Mark each: VERIFIED / UNVERIFIED / WISHFUL.

7. CHESTERTON'S FENCE
Why hasn't this already been done at scale? 
Who tried and failed, or why is the obvious incumbent ignoring this gap? 
If you cannot answer, that is a warning.

8. COMPETITIVE LANDSCAPE — THEM vs YOU
Name at least 3 direct competitors and 2 indirect substitutes/workarounds users already rely on. 
For each: their moat, their pricing, their distribution, their weakness. 
Then state honestly: what is YOUR unfair advantage that they cannot copy within 12 months? 
If the honest answer is "nothing structural — just speed/effort/taste," say so. 
Identify the one competitor most likely to kill this project and explain how.

9. CUI BONO
Map the incentive structure. 
Who profits if this works, who loses, where are the conflicts of interest, 
who has skin in the game and who is selling shovels.

10. ASYMMETRIC RISK
Realistic max downside (capital, time, reputation, legal). 
Realistic max upside. 
Estimated probability of: ruin / mediocre survival / breakout. 
Use percentages even if rough.

11. KILL CRITERIA
Define 3 measurable signals that mean STOP NOW. 
Specific metrics, specific thresholds, specific deadlines. 
No vague "if growth is slow."

12. HIDDEN ASSUMPTION AUDIT
List 5 assumptions the author is making without knowing they are making them. 
The blind spots, not the stated risks.

13. VERDICT
One paragraph. BUILD / KILL / PIVOT. 
If PIVOT: state the single most important change required, in one sentence.

Output format: Plain headings, short paragraphs. 
No bullet fluff. No emojis. No closing summary or "hope this helps." 
End on the verdict.
```

---

## Checklist Summary

- [ ] Phase 0: Chief Protein YES/NO on product type
- [ ] Phase 1: Complete all 10 discovery documents
- [ ] Phase 1.5: Run Brutal Assessment V1
- [ ] Phase 2: Build product based on assessment
- [ ] Phase 3: Create handoff document for Chief Protein (ELI5)
- [ ] Phase 4: Run Brutal Assessment V2 (before launch)
- [ ] Phase 4: Decision: BUILD / KILL / PIVOT

---

**Do not skip Phase 0. Do not code before YES.**
