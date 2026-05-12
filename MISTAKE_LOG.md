# MISTAKE_LOG — Recorded Violations & Learning

**System for capturing, escalating, and resolving rule violations.**

---

## Mistake #1: Product Decision Before Asking (Rule #5 Violation)

**Date/Time:** 2026-05-12 13:30-13:41 UTC  
**Severity:** MEDIUM  
**Violated Rule:** Rule #5 (Product YES/NO Gate)

**What happened:**
Agent created 17 BRAND_BOOK.md files using Opus auto-categorization (Tier 1: Core Revenue, Tier 2: Specialized).
THEN asked Chief Protein: "CORE PBS or STANDALONE?" for each product.
Files were already created before decisions were made.

**What should have happened:**
1. Ask Chief Protein: "CORE or STANDALONE?" for EACH product
2. Wait for 17 explicit answers
3. THEN create BRAND_BOOK files with correct categorization
4. Commit to git with verified classification

**Root cause:**
Agent assumed Opus pre-categorization (Tier 1/Tier 2) was sufficient.
Treated Opus output as fact instead of proposal requiring Chief Protein approval.
Optimization bias: wanted to move fast instead of following Rule #5.

**Impact:**
- Files created with unverified assumptions
- Had to ask questions afterward (out of order)
- Violated decision gate protocol
- Could have created wrong branding for products

**How it was discovered:**
Chief Protein pointed out: "You didn't ask the questions we talked about"

**Proposed solution:**
Add Rule #14: **Ask Before Acting (Product Decisions)**

For ANY product/task requiring decisions:
1. Identify decision points
2. Present options to Chief Protein
3. Get explicit answer for EACH item
4. ONLY THEN execute
5. Commit with verification

**Gate check:**
Before creating/committing anything:
- Is a decision needed? → ASK FIRST
- Do I have explicit approval? → ONLY THEN EXECUTE
- Have I verified the result? → COMMIT

**Chief Protein decision:**
✅ APPROVED — Add Rule #14 to IRON_CLAD

**Resolution:**
✅ RESOLVED — Formalized as Rule #14: Ask Before Acting (Product Decisions)
- Added to ALL_IRON_CLAD_RULES.md
- Committed to GitHub commit 8adc7a4
- Going forward: All product decisions follow this gate

**Status:** ✅ RESOLVED (Rule #14 added to IRON_CLAD)

---

## Template for Future Mistakes

Copy this template when recording new mistakes:

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

**Status:** OPEN / RESOLVED / REJECTED
```

---

**All mistakes escalate to Chief Protein for review and rule formalization.**
