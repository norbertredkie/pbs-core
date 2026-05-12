#!/usr/bin/env python3
"""
LLM API Health Check

Verifies all 4 LLM APIs that C-Level escalation depends on:
- OpenAI (GPT-4o)
- Anthropic (Claude Opus)
- xAI (Grok)
- Google (Gemini)

Run via heartbeat every 3 hours.
Alert on Telegram if any API is down.
Write status to API_STATUS.md for debugging.
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# API clients (lazy imports)
def test_openai():
    import openai
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Say OK in 1 word"}],
        max_tokens=10,
    )
    return response.choices[0].message.content.strip()

def test_anthropic():
    import anthropic
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=10,
        messages=[{"role": "user", "content": "Say OK in 1 word"}],
    )
    return message.content[0].text.strip()

def test_xai():
    import requests
    headers = {"Authorization": f"Bearer {os.getenv('XAI_API_KEY')}", "Content-Type": "application/json"}
    data = {
        "model": "grok-4.3",
        "input": [{"role": "user", "content": "Say OK in 1 word"}],
    }
    response = requests.post("https://api.x.ai/v1/responses", headers=headers, json=data)
    response.raise_for_status()
    result = response.json()
    # Extract text from output array (message is typically at index 1 after reasoning)
    for output_item in result.get("output", []):
        if output_item.get("type") == "message":
            content = output_item.get("content", [])
            if content and "text" in content[0]:
                return content[0]["text"].strip()
    raise ValueError("No text output found in xAI response")

def test_google():
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Say OK in 1 word")
    return response.text.strip()

APIS = {
    "openai": test_openai,
    "anthropic": test_anthropic,
    "xai": test_xai,
    "google": test_google,
}

def main():
    results = {}
    broken = []
    
    print(f"[{datetime.now()}] Checking LLM APIs...")
    
    for name, test_func in APIS.items():
        try:
            response = test_func()
            results[name] = ("✅", f"OK: {response[:20]}...")
            print(f"  {name}: ✅")
        except Exception as e:
            error_msg = str(e)[:100]
            results[name] = ("❌", error_msg)
            broken.append(name)
            print(f"  {name}: ❌ {error_msg}")
    
    # Determine escalation capability
    working_count = len(APIS) - len(broken)
    
    if working_count == 4:
        escalation_status = "✅ FULL ESCALATION (4-model debate)"
        can_escalate = True
    elif working_count == 3:
        escalation_status = "⚠️ DEGRADED ESCALATION (2/3 consensus required)"
        can_escalate = True
    elif working_count <= 2:
        escalation_status = "❌ NO ESCALATION (insufficient APIs, C-Level rules only)"
        can_escalate = False
    
    # Write status file
    status_path = Path("/Users/norbertredkie/_pbs/API_STATUS.md")
    with open(status_path, "w") as f:
        f.write(f"# LLM API Status\n\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        
        f.write(f"## API Status\n\n")
        for api, (status, msg) in results.items():
            f.write(f"- **{api}**: {status} {msg}\n")
        
        f.write(f"\n## Summary\n\n")
        f.write(f"**Working:** {working_count}/4\n")
        f.write(f"**Down:** {', '.join(broken) if broken else 'None'}\n\n")
        
        f.write(f"## C-Level Escalation\n\n")
        f.write(f"{escalation_status}\n\n")
        
        if working_count == 4:
            f.write(f"C-Level agents can escalate to full 4-model LLM debate.\n")
        elif working_count == 3:
            f.write(f"C-Level agents can escalate, but requires 2/3 consensus (not 3/4).\n")
        elif working_count == 2:
            f.write(f"C-Level agents CANNOT escalate. Must decide on hard-coded rules only.\n")
        else:
            f.write(f"CRITICAL: C-Level agents CANNOT escalate. System operating in rules-only mode.\n")
    
    # Alert via Telegram based on severity
    try:
        from message import send_telegram
        
        if working_count == 4:
            # All good
            send_telegram(f"✅ LLM APIs Healthy\n\nAll 4 operational at {datetime.now().strftime('%H:%M')}\n\nEscalation: FULL (4-model debate)")
            print(f"\n✅ All 4 LLM APIs working")
            sys.exit(0)
        
        elif working_count == 3:
            # Degraded but usable
            send_telegram(f"⚠️ LLM API Degraded\n\nDown: {', '.join(broken)}\n\nEscalation: 2/3 consensus required\n\nMonitor: /Users/norbertredkie/_pbs/API_STATUS.md")
            print(f"\n⚠️ 1 API down, escalation degraded")
            sys.exit(0)
        
        else:
            # Critical: can't escalate
            send_telegram(f"🚨 CRITICAL: LLM APIs Down\n\nWorking: {working_count}/4\nDown: {', '.join(broken)}\n\n❌ C-Level CANNOT escalate. Rules-only mode.\n\nImmediate action needed.")
            print(f"\n❌ CRITICAL: {len(broken)} APIs down, escalation blocked")
            sys.exit(1)
    
    except Exception as e:
        print(f"Warning: Could not send Telegram alert: {e}")
        if working_count < 3:
            sys.exit(1)
        else:
            sys.exit(0)

if __name__ == "__main__":
    main()
