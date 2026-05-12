# LEARNING PROTOCOL — Mistake Recording & Escalation

**System for capturing violations, learning from errors, and formalizing solutions into IRON_CLAD rules.**

---

## When a Mistake Happens

**Immediate response:**

1. **Identify the violation**
   - Which rule was violated?
   - What was done wrong?
   - What should have been done?

2. **Document in MISTAKE_LOG.md**
   ```
   ## Mistake [#N]
   - **Date/Time:** 2026-05-12 13:41 UTC
   - **Violated Rule:** Rule #5 (Product YES/NO Gate)
   - **What happened:** Created BRAND_BOOK files before asking CORE/STANDALONE questions
   - **What should have happened:** Ask questions FIRST, then create files
   - **Root cause:** Assumed Opus auto-categorization was sufficient
   - **Impact:** Files created with incorrect assumptions
   - **Proposed solution:** [see below]
   ```

3. **Escalate to Chief Protein**
   - Show mistake clearly
   - Explain impact
   - Propose solution
   - Ask: "Should this become a permanent rule?"

4. **Wait for Chief Protein approval**

5. **Add to IRON_CLAD if approved**
   - Document as new rule or strengthen existing rule
   - Add to `ALL_IRON_CLAD_RULES.md`
   - Update relevant protocol files
   - Commit to GitHub with [learning] tag

---

## Mistake Categories

### Category A: Rule Violation (Acting before asking)
**Pattern:** Agent performs action before getting decision from Chief Protein

**Example:** Creating BRAND_BOOK files before asking CORE/STANDALONE

**Prevention:** Add gate rule like:
```
RULE: Always ask questions BEFORE creating/committing
If decision needed: ASK → WAIT FOR ANSWER → EXECUTE
Never: EXECUTE → ASK → UPDATE
```

---

### Category B: Protocol Violation (Skipping required step)
**Pattern:** Agent skips verification, paranoia check, or required documentation

**Example:** Not running PARANOIA_PROTOCOL before escalation

**Prevention:** Explicit checklist requirement in relevant protocol

---

### Category C: Scope Violation (Wrong domain)
**Pattern:** Agent makes decision that belongs to C-Level role

**Example:** CEO decides technical implementation details

**Prevention:** Add decision authority matrix to rule

---

### Category D: Documentation Violation (Missing proof)
**Pattern:** Claims task complete without screenshot/test/artifact

**Example:** "BRAND_BOOK created" but no commit/verification

**Prevention:** VERIFICATION_PROTOCOL already covers this

---

## Solution Template

When proposing solution to Chief Protein:

```
## Mistake [#N]: [Name]

**What happened:** [2-3 sentences]

**Why it matters:** [Impact description]

**Root cause:** [Why the agent did this]

**Proposed solution:**
[Specific, actionable rule to prevent recurrence]

**How to implement:**
[Steps to add to IRON_CLAD]

**Approve?** YES / NO / MODIFY
```

---

## Adding to IRON_CLAD

**If Chief Protein says YES:**

1. **Create new rule or strengthen existing**
   - If new: Add as Rule #[N+1] to ALL_IRON_CLAD_RULES.md
   - If existing: Add clarification to relevant protocol file

2. **Format:**
   ```
   ### Rule [N]: [Name]
   
   **Origin:** Learned from Mistake #[N] on [date]
   
   **What it prevents:** [description]
   
   **Enforcement:** [checklist or gate]
   
   **Example:** [show the mistake + how rule prevents it]
   ```

3. **Commit with [learning] tag**
   ```
   git commit -m "[learning] Add Rule #N from Mistake #N
   
   Mistake: [brief description]
   Solution: [brief solution]
   Implementation: [brief implementation]"
   ```

4. **Update MISTAKE_LOG.md**
   ```
   ## Mistake [#N]
   ...
   **Status:** ✅ RESOLVED
   **Added to IRON_CLAD:** Yes, Rule #[N]
   **Commit:** [hash]
   ```

---

## MISTAKE_LOG.md Format

Each mistake entry:

```markdown
## Mistake [#N]: [Brief Title]

**Date/Time:** [timestamp]
**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Violated Rule:** [which rule(s)]

**What happened:**
[Describe the mistake clearly]

**What should have happened:**
[Describe correct behavior]

**Root cause:**
[Why did this happen?]

**Impact:**
[What went wrong as a result?]

**How it was discovered:**
[Who noticed? When?]

**Proposed solution:**
[Actionable fix]

**Chief Protein decision:**
[YES/NO/MODIFY with reasoning]

**Resolution:**
[How was it fixed?]
[If added to IRON_CLAD: which rule, commit hash]

**Status:** OPEN / RESOLVED / REJECTED
```

---

## Current Mistake Log

**Location:** `/Users/norbertredkie/.openclaw/workspace/MISTAKE_LOG.md`

Start fresh, log all violations from this point forward.

---

## Feedback Loop

```
Agent makes mistake
  ↓
Records in MISTAKE_LOG.md
  ↓
Escalates to Chief Protein with solution proposal
  ↓
Chief Protein approves/modifies/rejects
  ↓
If approved: Add to IRON_CLAD
  ↓
Agent learns: Apply rule going forward
  ↓
Document in MISTAKE_LOG.md as RESOLVED
```

---

## Example: Mistake #1 (Current)

**Mistake:** Rule #5 violation

**Proposed Rule Addition:**

```
### Rule #14: Ask Before Acting (Product Decisions)

**Origin:** Learned from Mistake #1 on 2026-05-12

**What it prevents:** Creating files/content before getting Chief Protein decision

**Enforcement:**
For any product/task decision:
1. Present options to Chief Protein
2. Wait for explicit answer
3. THEN create files/content
4. Commit with verification

**Gate:** If decision needed, STOP and ask. Never assume.

**Example:**
❌ Wrong: Create 17 BRAND_BOOKs → Ask CORE/STANDALONE
✅ Right: Ask CORE/STANDALONE → Create 17 BRAND_BOOKs → Verify

**Applies to:**
- Product decisions (CORE/STANDALONE)
- Scope decisions (which products to include)
- Categorization (priority, tier, classification)
```

---

**This protocol ensures:**
- ✅ No mistake is forgotten
- ✅ Every violation becomes learning
- ✅ Solutions are formalized into rules
- ✅ System improves over time
- ✅ Chief Protein oversight maintained

**Used for continuous improvement of PBS governance.**
