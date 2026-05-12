#!/bin/bash
# check_llm_apis_safe.sh — Paranoia Protocol wrapper
# Automatically: sources .env → verifies env → runs API checks → validates escalation
# Usage: bash scripts/check_llm_apis_safe.sh

set -e

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting Paranoia Protocol..."
echo ""

# Step 1: Navigate to PBS root and load environment
cd "$(dirname "$0")/../.."
echo "📁 Working directory: $(pwd)"

echo ""
echo "Step 1/4: Loading environment variables..."
if [ ! -f .env ]; then
    echo "❌ .env file not found at $(pwd)/.env"
    exit 1
fi

set -a
source .env
set +a
echo "✅ Environment loaded from .env"

# Step 2: Verify all keys are set
echo ""
echo "Step 2/4: Verifying API keys..."
if ! bash pbs-core/scripts/verify_env.sh; then
    echo ""
    echo "❌ Environment verification failed. Aborting API checks."
    exit 1
fi

# Step 3: Run API checks
echo ""
echo "Step 3/4: Testing all 4 LLM APIs..."
python3 pbs-core/scripts/check_llm_apis.py
HEALTH_CHECK_EXIT=$?

# Step 4: Verify escalation state
echo ""
echo "Step 4/4: Verifying C-Level escalation state..."
STATUS_FILE="/Users/norbertredkie/_pbs/API_STATUS.md"

if [ ! -f "$STATUS_FILE" ]; then
    echo "❌ Status file not found: $STATUS_FILE"
    exit 1
fi

if grep -q "✅ FULL ESCALATION" "$STATUS_FILE"; then
    echo "✅ C-Level escalation ENABLED (4-model debate ready)"
    ESCALATION_STATE="FULL"
elif grep -q "⚠️ DEGRADED ESCALATION" "$STATUS_FILE"; then
    echo "⚠️ C-Level escalation DEGRADED (2/3 consensus required)"
    ESCALATION_STATE="DEGRADED"
else
    echo "❌ C-Level escalation BLOCKED (rules-only mode)"
    ESCALATION_STATE="BLOCKED"
fi

echo ""
echo "================================================"
echo "Paranoia Protocol Complete"
echo "  Escalation: $ESCALATION_STATE"
echo "  Status: $STATUS_FILE"
echo "================================================"

# Exit with health check result
exit $HEALTH_CHECK_EXIT
