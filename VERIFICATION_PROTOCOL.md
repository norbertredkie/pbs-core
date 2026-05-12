# VERIFICATION PROTOCOL

**Rule: Never report completion without physical verification**

Effective date: 2026-05-11 19:50 GMT+2

---

## The Rule

**No task is complete until verified by reality, not documentation.**

- Design spec written ≠ design spec implemented
- Code file created ≠ code working
- "Should work" ≠ verified
- "Code exists" ≠ verified
- Documentation ≠ implementation

---

## Verification Checklist (Before Reporting Complete)

**All verification is CEO's responsibility. CEO is not human but verifies as if human, checking ALL instances (not spot-checks).**

For **design** tasks:
1. ✅ CEO reads design spec (BRAND_BOOK.md, DESIGN_SYSTEM.md, etc.)
2. ✅ CEO loads actual running application in browser
3. ✅ CEO screenshots ALL key sections (not just 1-2 examples)
4. ✅ CEO compares EACH screenshot with design spec
5. ✅ **CEO reports complete ONLY if ALL screenshots match spec exactly**

For **code** tasks:
1. ✅ CEO checks file exists + content correct
2. ✅ CEO runs code (execute, test, or deploy)
3. ✅ CEO verifies output matches expected behavior on EVERY test case
4. ✅ CEO tests edge cases + error conditions
5. ✅ **CEO reports complete ONLY if ALL tests pass**

For **git/deployment** tasks:
1. ✅ CEO runs git command or deployment script
2. ✅ CEO verifies remote exists AND is accessible (git remote -v + test clone)
3. ✅ CEO checks commit history is correct (git log --oneline)
4. ✅ CEO confirms push succeeded AND verify on GitHub
5. ✅ CEO tests deployed endpoint/service is live
6. ✅ **CEO reports complete ONLY if ALL verification passes**

For **link/reference** tasks (footnotes, citations, bibliography):

⚠️ **LIMITATION: Bot detection creates false data**
- HEAD requests → Bot detection blocks access (401/403)
- Selenium/Playwright → Bot detection shows fake 404s (error pages, ads, JavaScript errors)
- Tor/Onion browser → May bypass some blocks but still not 100% reliable
- **Only method: Real human browser with manual screenshots**

**CEO verification for links:**
1. ✅ CEO does NOT spot-check (10 links, 20 links)
2. ✅ CEO tests links that CAN be accessed without bot blocking
3. ✅ For paywalled/blocked links: Mark as YELLOW (unverifiable), not RED
4. ✅ Screenshot ALL links tested (proof of actual status, not false 404s)
5. ✅ **CEO reports: "These X links I could verify, these Y links are blocked by bot detection and cannot be verified"**
6. ✅ **For unverifiable links: Recommend author provide direct quotes in book as proof**

**Critical rule: Do NOT assume 404 in page content = broken link. Bot detection fakes 404s.**

---

## When in Doubt

**Always verify before claiming completion.** If you can't screenshot it, run it, or test it → it's not verified.

---

## Consequences of Violation

Violating this rule breaks trust and undermines the entire system. You have access because verification is assumed. Don't break that assumption.

---

## How to Enforce

- **Read this file before EVERY task** (not just completions)
- **Apply checklist to every single task** Norbert gives you
- **Double-verify before trusting yourself:**
  - Verify once (screenshot, test, run)
  - Verify the verification (check again, don't assume)
  - Only then report findings
- If you skip verification, you've violated the rule
- Report gaps honestly, not assumed completions

---

## CEO Double Verification Pattern (As-If-Human Protocol)

CEO is not human but must verify as if human. This means:

1. **Automated pass:** Run quick automated checks (HEAD requests, unit tests, lint)
2. **Browser simulation pass:** Use Selenium/Playwright to simulate real user behavior
   - Load pages in real browser (not just HEAD requests)
   - Handle JavaScript rendering
   - Navigate through content
   - Test edge cases
3. **Comparison & discrepancy analysis:** 
   - Compare automated results vs browser results
   - Identify where automation missed things (link rot, paywalls, JS-locked content)
   - Document all differences
4. **Screenshot proof of critical items:**
   - ALL broken links (RED)
   - 10% sample of working links (GREEN)
   - Problematic paywalls (YELLOW)
5. **Only then report findings with full transparency**

**Example (Link verification):**
- Automated: 50 links tested via HEAD → shows "0 RED"
- Browser: Same 50 links tested via Selenium → finds "3 RED" (link rot, 404s)
- Report: "Automated said 0 RED. Browser found 3 RED. True count: 3."
- Screenshot: Show actual 404 page for each broken link
- Verdict: "Automation insufficient. Browser verification is ground truth."

---

## CEO Verification Responsibility (Mandatory for Every Task)

**CEO must verify before ANY "complete" claim on:**
- Design verification — check ALL screens, not 1-2
- Code execution — test ALL test cases
- Git operations — verify on GitHub, not just local
- API health checks — browser simulation, not just HEAD requests
- Deployment verification — test actual endpoint
- Feature testing — test ALL features + edge cases
- Link/citation checking — **SPECIAL RULE BELOW**
- Any "it's done" claim

**The rule:** If a task can scale (100 links, 50 test cases, 10 screens), CEO checks ALL, not spot-checks.

**Why:** Automation misses things. Real verification means treating the system as a user would.

**SPECIAL EXCEPTION — Link/Reference Verification:**
- ⚠️ **Bot detection makes automated testing unreliable**
- Selenium/Playwright → Bot detection shows fake 404s (JavaScript errors, fake pages, ads)
- HEAD requests → Blocked with 401/403
- Tor/Onion → May bypass but still unreliable
- **Only reliable method: Real human browser with manual screenshots**

**For large link sets (100+ links):**
1. Sample manually with real browser (50-100 links)
2. Screenshot EACH link tested (proof of actual status)
3. Document which links can/cannot be accessed
4. Mark unverifiable/blocked as YELLOW (not RED)
5. Report honestly: "Verified X links, blocked/unverifiable Y links"

**Why this exception:** Bot detection is designed to block automated access. No detection system knows to trust an AI. Only humans bypass bot detection naturally.

No exceptions for "we don't have time" or "it's mostly correct." Credibility depends on complete verification.

---

## Real-World Example: Paranoia Protocol (2026-05-12)

**The Failure:**
- 5+ hour API outage (04:00-09:15 UTC)
- Heartbeat script marked all APIs as "down"
- System stuck in Rules-Only Mode
- User had no alerts for hours

**Root Cause:**
- Script never sourced `.env` file
- Environment variables missing
- Telegram alerts failed silently

**What Should Have Happened (Verification Protocol):**
1. ✅ Load env: `source .env && echo $ANTHROPIC_API_KEY` (verify output not empty)
2. ✅ Verify keys: `verify_env.sh` paranoia checks (all 4 keys exist + right format)
3. ✅ Test APIs: `check_llm_apis.py` (all 4 pass)
4. ✅ Verify alerts: Telegram message arrives (user sees it)
5. ✅ Only then claim: "API health check complete"

**What Actually Happened:**
- Script ran but didn't verify environment
- Silent failure (no paranoia checks)
- No alert delivery verification
- "Complete" claim with zero evidence

**The Fix:**
- Created `verify_env.sh` (paranoia: double-check all keys)
- Created `check_llm_apis_safe.sh` (load env → verify → test → validate)
- Both are now mandatory wrappers
- Every heartbeat run follows verification checklist

**Lesson:** "API check ran" ≠ "APIs are healthy". Verification requires:
- Environment actually loaded
- Keys actually present + right format
- APIs actually responding
- Escalation state actually FULL (not blocked)

**Applied Rule:** Never trust env vars. Always verify. Always double-check.

---

**This rule is non-negotiable.**

Signed: Norbert Redkie (2026-05-11 19:51 GMT+2)  
Updated: Double verification requirement added
