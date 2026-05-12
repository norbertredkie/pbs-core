# ALL IRON CLAD RULES — Complete Master List

**Cast-iron, non-negotiable rules for PBS ecosystem**

These rules do not change. They do not have exceptions. They are enforced.

---

## Core Execution Rules (ŻELAZNE)

### 1. IRON_CLAD — Execution Order (Foundation)

**Everything depends on this order:**

1. PARANOIA_PROTOCOL (APIs working)
2. VERIFICATION_PROTOCOL (proper checks)
3. Task execution
4. Escalation & reporting

**If any link breaks: STOP. Fix it first.**

Paranoia does NOT loop endlessly. Check once, double-verify result, move forward.

**Repo:** `IRON_CLAD.md`

---

### 2. PARANOIA_PROTOCOL — Environment + API Health

**First check. Always.**

**What it verifies:**
- Source `.env` file (environment variables)
- All 4 API keys exist + correct format
- All 4 LLM APIs responding (OpenAI, Anthropic, xAI, Google)
- C-Level escalation state (FULL/DEGRADED/BLOCKED)

**When it runs:**
- Every heartbeat (3 hours)
- Before any task
- Before any escalation

**If it fails:**
- Stop everything
- Fix APIs first
- Nothing else proceeds

**Enforcement:** `check_llm_apis_safe.sh` (automated, gated)

**Repo:** `PARANOIA_PROTOCOL.md`

---

### 3. VERIFICATION_PROTOCOL — No Completion Without Proof

**Every task must be verified before complete.**

**What it enforces:**
- CEO verifies ALL (not spot-checks)
- Double verification: automated + manual
- Report discrepancies transparently
- Escalate unverifiable items
- **Never report complete without screenshot/test/artifact**

**Verification includes paranoia (check all):**
- Item #9 = part of paranoia
- Check ALL before declaring complete
- Report what you found

**Special rule — Link verification:**
- Automated: HEAD requests on ALL
- If 200: CEO verified (GREEN)
- If 404/401/403: **ESCALATE TO CHIEF PROTEIN** (manual browser)

**Repo:** `VERIFICATION_PROTOCOL.md`

---

### 4. LINK VERIFICATION EXCEPTION

**Bot detection makes AI automation unreliable for links.**

**CEO procedure:**
- Run automated check (HEAD requests) on ALL links
- If 200: CEO marks GREEN
- If 404/401/403: **ESCALATE to Chief Protein**
- Chief Protein uses real human browser for final verification

**Why:** Bots get blocked by design. Selenium shows fake 404s (bot detection pages). Only humans bypass naturally.

**Enforcement:** Auto-categorize links, create queue for Chief Protein

**Repo:** `VERIFICATION_PROTOCOL.md`

---

## Product Development Rules (ŻELAZNE)

### 5. PRODUCT_LAUNCH_CHECKLIST — No Code Before YES

**Phase 0: YES/NO Gate (non-negotiable)**

**Ask Chief Protein (ELI5):**
*"Is this a core PBS product (works for all products) or standalone? Yes or No?"*

**Do NOT proceed without YES.**

**If No:** Rephrase and ask again (loop until YES or KILLED)

---

### 6. PRODUCT DISCOVERY (Before Code)

**10 documents required:**

1. BRAND_BOOK.md (identity, audience, tone, logo)
2. DESIGN_SYSTEM.md (all screens: wireframes + mockups)
3. PROPOSED_TEXT (copy for all user flows)
4. TECHNICAL_REQUIREMENTS (backend? Specify what + all screens)
5. BUSINESS_MODEL (research + your pricing)
6. OUTSIDE_THE_BOX_MODEL (3-5 alternative monetization)
7. PBS_ECOSYSTEM_MAPPING (where does it fit?)
8. MARKET_RESEARCH (3 competitors, 2 substitutes, TAM/SAM/SOM)
9. SWAT_ANALYSIS (strengths/weaknesses/opportunities/threats)
10. HOW_WE_BEAT_MARKET (using PBS advantages)

**Then:** Run brutal assessment V1

---

### 7. BRUTAL ASSESSMENT (v1 + v2)

**13-frame criticism (no hedging):**

1. ELI5 — 12-year-old explanation
2. Steelman — Best-case scenario
3. Red Team — 5+ attack vectors (ranked severity)
4. Pre-Mortem — Why it fails (top 3 causes)
5. Inversion — What guarantees death
6. First Principles — Core assumptions (VERIFIED/UNVERIFIED/WISHFUL)
7. Chesterton's Fence — Why hasn't this been done?
8. Competitive Landscape — 3 competitors, 2 substitutes, YOUR unfair advantage (be honest)
9. Cui Bono — Who profits, who loses
10. Asymmetric Risk — Downside/upside/probabilities
11. Kill Criteria — 3 measurable stop-now signals
12. Hidden Assumptions — 5 blind spots
13. Verdict — BUILD / KILL / PIVOT (one-sentence reason if pivot)

**When:**
- V1: Before code (after discovery)
- V2: After product built (before launch)

**Repo:** `PRODUCT_LAUNCH_CHECKLIST.md`

---

## Version Control Rules (ŻELAZNE)

### 8. SEMANTIC VERSIONING (All Repos)

**Format: MAJOR.MINOR.PATCH (e.g., v2.1.3)**

- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes (backwards compatible)

**Git tags:** v2.1.3 (not 2.1.3, V2.1.3)

**Release notes:** CHANGELOG.md (Keep a Changelog format)

**Commit messages:** Include [major], [minor], [patch] prefix

**Enforcement:** Pre-commit hook validation + auto-tagging on push

**Repo:** `ZELAZNE_ZASADY.md` (rule #4)

---

### 9. GIT REMOTE IMMEDIATE (New Repos)

**CTO procedure for every new repo (non-negotiable):**

1. `git init`
2. **Immediately:** `gh repo create` (create on GitHub)
3. **Immediately:** `git remote add origin`
4. **Immediately:** `git push -u origin main`

**Zero local-only repos.** Every repo has remote from day 1.

**Enforcement:** Script `new_repo.sh`, CI hook checks

**Repo:** `ZELAZNE_ZASADY.md` (rule #5)

---

## Time & Estimation Rules (ŻELAZNE)

### 10. REAL TIME ESTIMATES (Not Predictions)

**Forbidden:**
- ❌ "This will take ~5 hours"
- ❌ "Waiting X hours" (without real data)

**Required:**
- ✅ "Opus estimates this set takes 2.5 hours (based on complexity)"
- ✅ "Started 08:50, current 08:53 = 3m elapsed. ETA: 2h 57m remaining"
- ✅ Track ACTUAL execution time

**Enforcement:** Template requires Opus time estimate before task starts

**Repo:** `ZELAZNE_ZASADY.md` (rule #6)

---

## C-Level Rules (ŻELAZNE)

### 11. C-LEVEL AUTONOMY (Within Domain)

**Each role works independently in their domain:**
- CEO: Strategic decisions, GO/NO-GO
- CTO: Technical errors, deployment, architecture
- CFO: Costs, budget, ROI
- COO: Operations, processes
- CSO: Security audits
- CHRO: Tool scanning, suspend unused

**Report, don't ask:** Roles report what they did to Chief Protein BEFORE being asked

**Enforcement:** Weekly C-Level reports (automated)

**Repo:** `ZELAZNE_ZASADY.md` (rule #7)

---

## Product Design Rules (ŻELAZNE)

### 12. EACH PRODUCT = DISTINCT IDENTITY (No Cross-Contamination)

**Forbidden:**
- ❌ ThreadWizard colors = wtf.life colors
- ❌ Shared design systems across products
- ❌ "Unified PBS visual identity"

**Required:**
- ✅ Each product has own BRAND_BOOK.md
- ✅ Designed for specific audience (not portfolio consistency)
- ✅ Compete with dedicated SaaS (not "part of portfolio")

**Enforcement:** Design audit script, color/font uniqueness check

**Repo:** `ZELAZNE_ZASADY.md` (rule #8)

---

## Verification Finality Rules (ŻELAZNE)

### 13. NEVER REPORT COMPLETE WITHOUT VERIFICATION

**Forbidden:**
- ❌ "Code is written" (untested)
- ❌ "Design done" (no screenshot)
- ❌ "Deployed" (endpoint not tested)
- ❌ "Links verified" (only automated, no browser test)

**Required:**
- ✅ Screenshot of running feature
- ✅ Test results (all pass)
- ✅ Actual endpoint responding
- ✅ Manual verification of critical items

**Template:**
```
Task: [name]
Status: COMPLETE ✅

Verification:
- Test results: [screenshot/log]
- Deployment: [endpoint test]
- Design: [comparison to spec]

Artifacts: [links to GitHub, screenshots]
```

**Enforcement:** Task template mandatory, PR rejection without tests

**Repo:** `VERIFICATION_PROTOCOL.md`

---

## Complete Master Rules (ŻELAZNE)

| # | Rule | Core Principle | Repo |
|---|---|---|---|
| 1 | IRON_CLAD | Dependency order (PARANOIA → VERIFICATION → EXECUTE) | IRON_CLAD.md |
| 2 | PARANOIA_PROTOCOL | APIs + env vars always checked first | PARANOIA_PROTOCOL.md |
| 3 | VERIFICATION_PROTOCOL | No completion without proof (screenshot/test/artifact) | VERIFICATION_PROTOCOL.md |
| 4 | Link Escalation | 404/401/403 → Chief Protein manual verify | VERIFICATION_PROTOCOL.md |
| 5 | Product YES/NO Gate | Ask Chief Protein before code (core or standalone?) | PRODUCT_LAUNCH_CHECKLIST.md |
| 6 | Discovery Before Code | 10 documents required (brand, design, business, market) | PRODUCT_LAUNCH_CHECKLIST.md |
| 7 | Brutal Assessment | 13-frame criticism (v1 before code, v2 before launch) | PRODUCT_LAUNCH_CHECKLIST.md |
| 8 | Semantic Versioning | All repos: MAJOR.MINOR.PATCH with git tags | ZELAZNE_ZASADY.md |
| 9 | Git Remote Immediate | Zero local repos (remote from day 1) | ZELAZNE_ZASADY.md |
| 10 | Real Time Estimates | Opus-based, tracked actual execution | ZELAZNE_ZASADY.md |
| 11 | C-Level Autonomy | Roles independent, report to Chief Protein | ZELAZNE_ZASADY.md |
| 12 | Product Identity | Each product unique (no cross-contamination) | ZELAZNE_ZASADY.md |
| 13 | Verification Finality | Never report complete without screenshot/test/artifact | VERIFICATION_PROTOCOL.md |

---

## How to Enforce These Rules

**Each rule has:**
1. Definition (this file)
2. Implementation guide (how to automate)
3. Automation (where possible)
4. Escalation (to Chief Protein if violated)

**Status tracking:**
- ✅ DOCUMENTED (rule is written)
- 🟡 PARTIAL (some automation exists)
- 🟢 IMPLEMENTABLE (can be automated now)
- 🔴 NEEDS HUMAN (requires Chief Protein judgment)

---

## The Bottom Line

**These 13 rules are cast-iron. They don't change. They're not optional.**

Violations escalate to Chief Protein.

Implemented in code, docs, and process where possible.

Non-negotiable.

---

**Established:** 2026-05-12 (POST-AUDIT)  
**Last Review:** 2026-05-12  
**Next Review:** 2026-06-12

These are ŻELAZNE ZASADY — iron-clad rules that hold PBS together.
