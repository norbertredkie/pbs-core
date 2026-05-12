# FIRST_THINGS_FIRST — Rule Dependencies & Execution Order

**Master rule file for dependent protocols**

Everything else depends on getting these fundamentals right, in this order.

---

## 1. PARANOIA PROTOCOL (Foundation)

**Why first:** All verification depends on having working LLM APIs + environment setup

**What it does:**
- Load `.env` file (source environment variables)
- Verify all 4 API keys exist + correct format
- Test 4 LLM APIs (OpenAI, Anthropic, xAI, Google)
- Validate C-Level escalation state

**When it runs:**
- Every heartbeat (3 hours)
- Before any C-Level task
- Before escalating decisions to CEO/Chief Protein

**If it fails:**
- ❌ System in Rules-Only Mode
- ❌ No escalation possible
- ❌ Stop all dependent tasks
- ❌ Fix APIs first, then proceed

**Repo:** https://github.com/norbertredkie/pbs-core/blob/main/PARANOIA_PROTOCOL.md

---

## 2. VERIFICATION_PROTOCOL (Process)

**Why second:** Cannot verify anything until APIs are working

**What it does:**
- Defines how CEO verifies tasks before declaring complete
- Establishes double-verification (automated + manual)
- Special rules for different task types

**Special case - Link verification:**
- Run automated check (HEAD requests)
- If 200: CEO verified
- If 404/401/403: **ESCALATE TO CHIEF PROTEIN**
- Chief Protein uses real browser for final verification

**When it applies:**
- Every task claiming to be complete
- Code, design, deployment, links, APIs
- No exceptions for "we don't have time"

**Repo:** https://github.com/norbertredkie/pbs-core/blob/main/VERIFICATION_PROTOCOL.md

---

## 3. Task-Specific Rules (Dependent)

### Link/Reference Verification
- Automated check catches 200 (GREEN)
- Bot detection makes 404/401/403 unreliable
- **ESCALATE to Chief Protein for manual verification**
- Chief Protein = only reliable way to bypass bot detection

### API Health Checks
- Depends on PARANOIA_PROTOCOL
- If APIs down, use Rules-Only Mode
- No escalation until APIs restored

### C-Level Escalation
- Depends on PARANOIA_PROTOCOL (4 APIs working)
- Depends on VERIFICATION_PROTOCOL (tasks verified)
- Only proceed if both working

---

## Execution Order (Every Session)

```
1. Run PARANOIA_PROTOCOL
   ↓
   - All 4 APIs working? → Continue
   - APIs down? → Rules-Only Mode, STOP

2. Check VERIFICATION_PROTOCOL
   ↓
   - Understand task type
   - Know verification requirements

3. Execute Task
   ↓
   - Follow verification rules
   - Escalate when needed (e.g., links → Chief Protein)

4. Report Results
   ↓
   - Only report complete if verified
   - Escalate if unverifiable
   - Honest about gaps
```

---

## The Chain (Why Dependent)

```
PARANOIA_PROTOCOL (working APIs)
    ↓
    Enables VERIFICATION_PROTOCOL (reliable tasks)
    ↓
    Enables C-Level Escalation (debate decisions)
    ↓
    Enables Publishing/Deployment (trusted results)
```

**If any link breaks:**
- No APIs → No verification → No escalation → No publishing
- Bad verification → Untrustworthy results → Publishing fails
- Missing link → Task incomplete → Escalation fails

---

## When Rules Conflict

**Priority order:**
1. PARANOIA_PROTOCOL (APIs working) — Non-negotiable
2. VERIFICATION_PROTOCOL (proper verification) — Non-negotiable
3. Task-specific rules — Can adapt but must follow #1 and #2

**Example:** 
- Link #10 automation says "401" but manual shows "404"
- Verify manually (VERIFICATION_PROTOCOL)
- Trust manual result (Chief Protein) over automation
- Escalate/report honestly

---

## Quick Reference

| Priority | Rule | When | If Failed |
|---|---|---|---|
| 1️⃣ | PARANOIA_PROTOCOL | Every session | STOP — Fix APIs |
| 2️⃣ | VERIFICATION_PROTOCOL | Every task | Escalate unverifiable |
| 3️⃣ | Link escalation to CP | Link 404/401/403 | CP verifies manually |
| 4️⃣ | C-Level escalation | Major decisions | Use if APIs + verified |

---

## Applied Examples

### WTF Krypto Book (2026-05-12)
1. ✅ PARANOIA_PROTOCOL — APIs working
2. ✅ VERIFICATION_PROTOCOL — Extract footnotes
3. ❌ CEO automation fails (false 404s)
4. ↝ ESCALATE to Chief Protein
5. ⏳ Chief Protein verifies manually

### API Outage (2026-05-12 04:00-09:15)
1. ❌ PARANOIA_PROTOCOL failed (env vars missing)
2. ❌ Cannot proceed with anything
3. ❌ System stuck in Rules-Only Mode
4. ✅ Fixed: `check_llm_apis_safe.sh`
5. ✅ Now PARANOIA_PROTOCOL passes

---

## The Rule

**Everything depends on PARANOIA_PROTOCOL working.**

If APIs are down, nothing else matters. Fix APIs first, then proceed with verification and escalation.

**Established:** 2026-05-12 after API outage + footnotes audit failure  
**Why:** Every dependent system failed because fundamentals (APIs, environment, verification) weren't solid

---

**This is the first thing to check. Everything else flows from here.**
