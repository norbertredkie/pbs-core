# ŻELAZNE ZASADY — Iron-Clad Rules Implementable in PBS

**Master list of non-negotiable, cast-iron rules for PBS ecosystem**

These are enforceable, automatable, and already defined. Can be implemented in pbs-core now.

---

## 1. FIRST_THINGS_FIRST — Dependency Order (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**File:** `FIRST_THINGS_FIRST.md`  
**Implementation:** Enforced in all task execution

```
1. PARANOIA_PROTOCOL (APIs working) → Non-negotiable foundation
2. VERIFICATION_PROTOCOL (proper verification) → Required for all tasks
3. Task-specific escalations → Defined by task type
4. C-Level decisions → Only if 1-3 solid
5. Publishing/deployment → Only if everything verified
```

**How to enforce:**
- Every task starts with PARANOIA_PROTOCOL check
- If APIs down → STOP, fix APIs first
- Task cannot proceed to verification without PARANOIA passing
- CAN be automated: `check_llm_apis_safe.sh` gate

---

## 2. PARANOIA_PROTOCOL — Environment + API Verification (🟢 Implementable)

**Status:** ✅ DOCUMENTED & PARTIALLY AUTOMATED  
**Files:**
- `PARANOIA_PROTOCOL.md`
- `scripts/check_llm_apis_safe.sh`
- `scripts/verify_env.sh`

**What it enforces:**
- Source `.env` file (no environment variables assumed)
- Verify all 4 API keys exist + correct format
- Test 4 LLM APIs (OpenAI, Anthropic, xAI, Google)
- Validate C-Level escalation state (FULL/DEGRADED/BLOCKED)

**How to enforce:**
- Run `check_llm_apis_safe.sh` before every heartbeat (3 hours)
- Fail fast if APIs down (exit code 1)
- No escalation possible without FULL escalation state
- Can be cron-triggered

---

## 3. VERIFICATION_PROTOCOL — No Completion Without Verification (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**File:** `VERIFICATION_PROTOCOL.md`

**What it enforces:**
- CEO checks ALL (not spot-checks) for: code, design, deployment, links
- Double verification: automated + manual
- Report discrepancies transparently
- Link verification special rule: escalate 404/401/403 to Chief Protein
- **NEVER report complete without screenshot/test/artifact proof**

**How to enforce:**
- Template for task completion: require screenshot/log/artifact
- Code review checklist: must pass all tests
- Design review: compare to BRAND_BOOK.md
- Deployment: test actual endpoint
- Links: automated → browser → Chief Protein (if needed)

---

## 4. Semantic Versioning for All Repos (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**Rule from:** `AGENTS.md`

```
Format: MAJOR.MINOR.PATCH (e.g., v2.1.3)
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes (backwards compatible)

Git tags: v2.1.3 (not 2.1.3, V2.1.3, or variant)
Release notes: CHANGELOG.md following Keep a Changelog format
Commit messages: Include [major], [minor], [patch] prefix
```

**How to enforce:**
- Pre-commit hook: validate version format
- Script: auto-tag on push if version bumped
- CI/CD: fail if commit has no version prefix
- Can check with: `git describe --tags --always`

**Example commits:**
```bash
git commit -m "[major] Break debate engine API"
git commit -m "[minor] Add new C-Level agent"
git commit -m "[patch] Fix timeout bug"
```

---

## 5. Git Remote + Push on Repository Creation (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**Rule from:** `AGENTS.md`

**CTO procedure for every new repo:**
1. `git init`
2. **Immediately:** `gh repo create` (create on GitHub)
3. **Immediately:** `git remote add origin`
4. **Immediately:** `git push -u origin main`

**Zero local-only repos.** Every repo has remote from day 1.

**How to enforce:**
- Script: `new_repo.sh` — automate this 4-step process
- CI hook: fail if remote doesn't exist
- Regular audit: check for repos without origin

---

## 6. Time Estimates Must Be Real, Not Predicted (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**Rule from:** `AGENTS.md`

**What it forbids:**
- ❌ "This will take ~5 hours" (prediction, meaningless)
- ❌ "Waiting X hours" without real data

**What it requires:**
- ✅ "Opus estimates this task set takes 2.5 hours based on complexity"
- ✅ "Subagent started at 08:50, current time 08:53 = 3 min elapsed. ETA: 2h 57m remaining"
- ✅ Track ACTUAL execution time, not guesses

**How to enforce:**
- Template: require Opus time estimate before task
- Logging: capture task start/end times
- Report: show actual vs estimated time
- Audit: quarterly review of estimate accuracy

---

## 7. C-Level Autonomy (Works with Chief Protein Oversight) (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**Rule from:** `AGENTS.md`

**Each C-Level role works autonomously in their domain:**
- CEO: Strategic decisions, GO/NO-GO
- CTO: Technical errors, deployment, architecture
- CFO: Costs, budget, ROI
- COO: Operations, processes
- CSO: Security audits
- CHRO: Tool scanning, suspend unused

**Report, don't ask:** Roles report what they did to Chief Protein BEFORE Chief Protein asks.

**How to enforce:**
- Weekly C-Level reports (automated via script)
- Chief Protein dashboard: what each role did this week
- Alert if role hasn't reported (missing oversight)
- Rules checked: Did role stay in their domain?

---

## 8. Each Product Has Distinct Identity (No Cross-Contamination) (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**Rule from:** `AGENTS.md`

**What it forbids:**
- ❌ ThreadWizard colors = wtf.life colors
- ❌ Shared design systems across products
- ❌ "Unified PBS visual identity"

**What it requires:**
- ✅ Each product has own BRAND_BOOK.md
- ✅ Designed for specific audience (not portfolio consistency)
- ✅ Compete with dedicated SaaS (not "part of portfolio")

**Products:**
- wtf.life (crypto): Gold, professional, literary
- ThreadWizard: Violet/cyan, energetic, creator-focused
- anna-art: Warm, cultural, educational
- PBS v5: Dark, technical, strategic

**How to enforce:**
- Audit: check each product's BRAND_BOOK.md exists + unique
- Design review: compare product to competitors (not other PBS products)
- CI check: colors/fonts different from other products (automated via color analysis)

---

## 9. Never Report Completion Without Verification (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**Rule from:** `VERIFICATION_PROTOCOL.md`

**What it forbids:**
- ❌ "Code is written" → untested
- ❌ "Design done" → no screenshot
- ❌ "Deployed" → endpoint not tested
- ❌ "Links verified" → only automated check (no browser test)

**What it requires:**
- ✅ Screenshot of running feature
- ✅ Test results (all pass)
- ✅ Actual endpoint responding
- ✅ Manual verification of critical links

**Template:**
```
Task: [name]
Status: COMPLETE ✅

Verification:
- Test results: [screenshot/log]
- Deployment: [endpoint test]
- Design: [comparison to spec]
- Links: [verification method]

Artifacts: [links to GitHub, screenshots, etc.]
```

**How to enforce:**
- Task template: completion impossible without verification section
- CI/CD: require artifact uploads
- Code review: reject PRs without test screenshots

---

## 10. Link Verification Special Rule: Escalate to Chief Protein (🟢 Implementable)

**Status:** ✅ DOCUMENTED  
**Rule from:** `VERIFICATION_PROTOCOL.md`

**What it forbids:**
- ❌ Accepting Selenium 404s as truth (false positives from bot detection)
- ❌ CEO claims "verified all links" without Chief Protein manual check
- ❌ Using automation alone for 404/401/403 links

**What it requires:**
- ✅ Automated check: HEAD requests on ALL links
- ✅ If 200: CEO marks as GREEN
- ✅ If 404/401/403: **ESCALATE to Chief Protein**
- ✅ Chief Protein: manual browser verification only

**How to enforce:**
- Script: auto-categorize links (GREEN vs 404/401/403)
- Queue: create escalation list for Chief Protein
- Completion check: ensure Chief Protein verified before publishing
- Template: show which links escalated + why

---

## Quick Implementation Checklist

- [ ] 1. FIRST_THINGS_FIRST — Enforce dependency order (gate all tasks)
- [ ] 2. PARANOIA_PROTOCOL — Run on heartbeat (3-hour automation)
- [ ] 3. VERIFICATION_PROTOCOL — Require verification template for all tasks
- [ ] 4. Semantic Versioning — Pre-commit hook + auto-tag
- [ ] 5. Git Remote — Script for `new_repo.sh` automation
- [ ] 6. Time Estimates — Require Opus estimate before task
- [ ] 7. C-Level Autonomy — Weekly report automation
- [ ] 8. Product Identity — Design audit script + BRAND_BOOK.md check
- [ ] 9. Verification Required — Task template + artifact upload
- [ ] 10. Link Escalation — Auto-categorize links, create queue for Chief Protein

---

## Implementation Priority

**Phase 1 (Immediate):**
- FIRST_THINGS_FIRST (framework)
- PARANOIA_PROTOCOL (already 80% done)
- Verification template (task creator)

**Phase 2 (This week):**
- Semantic versioning (pre-commit hook)
- Git remote automation
- C-Level reports

**Phase 3 (This sprint):**
- Product identity audit
- Link escalation queue
- Time estimate tracking

---

## Enforcement Mechanism

**Each rule has:**
1. Definition (in this file)
2. Implementation guide (how to enforce)
3. Automation (where possible)
4. Escalation (to Chief Protein if violated)

**Status tracking:**
- ✅ DOCUMENTED — Rule is written down
- 🟡 PARTIAL — Some automation exists
- 🟢 IMPLEMENTABLE — Can be automated now
- 🔴 NOT IMPLEMENTABLE — Needs human judgment

---

**These are żelazne. They don't change. They get enforced.**

Established: 2026-05-12 (POST-AUDIT)  
Next review: 2026-06-12 (monthly)
