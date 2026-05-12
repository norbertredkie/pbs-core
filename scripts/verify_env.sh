#!/bin/bash
# verify_env.sh — Paranoia Protocol: Double-check all API keys
# Usage: bash scripts/verify_env.sh

set -e

echo "🔍 Paranoia Protocol: Environment Verification"
echo "================================================"

ERRORS=0

# Define required keys and their expected prefixes
declare -A REQUIRED_KEYS=(
    [OPENAI_API_KEY]="sk-proj-"
    [ANTHROPIC_API_KEY]="sk-ant-"
    [XAI_API_KEY]="xai-"
    [GOOGLE_API_KEY]="AIza"
)

for key in "${!REQUIRED_KEYS[@]}"; do
    prefix="${REQUIRED_KEYS[$key]}"
    value="${!key}"
    
    if [ -z "$value" ]; then
        echo "❌ $key — NOT SET"
        ERRORS=$((ERRORS+1))
    elif [[ ! "$value" =~ ^$prefix ]]; then
        echo "❌ $key — WRONG FORMAT (expected to start with: $prefix)"
        ERRORS=$((ERRORS+1))
    elif [[ "$value" == *"YOUR_KEY"* ]]; then
        echo "❌ $key — PLACEHOLDER VALUE (not a real key)"
        ERRORS=$((ERRORS+1))
    else
        # Show first 30 chars of key for verification
        preview=$(echo "$value" | head -c 30)
        echo "✅ $key — OK ($preview...)"
    fi
done

echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ All API keys verified successfully."
    exit 0
else
    echo "🚨 $ERRORS key(s) failed verification."
    echo ""
    echo "Fix: Load environment variables from .env"
    echo "  set -a && source /Users/norbertredkie/_pbs/.env && set +a"
    echo ""
    exit 1
fi
