"""
PBS Weekly Opportunity Research Runner
Orchestrates debate between 4 AI agents and generates consensus reports
for C-level decision makers.

Schedule: Every Monday 12:00 CET
Output: c-level/docs/weekly-opportunities/WEEKLY_OPPORTUNITIES_YYYY-MM-DD.md
"""
import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

# Add debate-agents to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "debate-agents"))

from debate_grok.src.agent import DebateAgentGrok, DebateResult as GrokResult
from debate_anthropic.src.agent import DebateAgentAnthropic
from debate_chat.src.agent import DebateAgentChat
from debate_gemini.src.agent import DebateAgentGemini
from consensus_engine import DebateConsensusEngine, ConsensusResult

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WeeklyOpportunityRunner:
    """Run weekly debate and generate opportunity analysis."""
    
    def __init__(self):
        """Initialize runner with agents and paths."""
        self.agents = {
            "grok": DebateAgentGrok(),
            "chat": DebateAgentChat(),
            "anthropic": DebateAgentAnthropic(),
            "gemini": DebateAgentGemini()
        }
        self.consensus_engine = DebateConsensusEngine()
        self.output_dir = Path(__file__).parent.parent.parent / "c-level" / "docs" / "weekly-opportunities"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.prompt_file = Path(__file__).parent.parent.parent / "debate-agents" / "debate-engine" / "src" / "prompts" / "weekly-opportunity-research.md"
    
    def load_prompt(self) -> str:
        """Load the weekly research prompt."""
        try:
            if self.prompt_file.exists():
                with open(self.prompt_file, 'r') as f:
                    return f.read()
            else:
                logger.warning(f"Prompt file not found: {self.prompt_file}")
                return self._get_default_prompt()
        except Exception as e:
            logger.error(f"Failed to load prompt: {str(e)}")
            return self._get_default_prompt()
    
    def _get_default_prompt(self) -> str:
        """Get default prompt if file not found."""
        return """# PBS Weekly AI Business Opportunity Research

Research the top 30-50 AI business opportunities this week across:
- SaaS/Software products
- Automation agencies
- Developer tools
- E-commerce tools
- Creator tools
- Local service automation

For each opportunity identify:
1. Market demand (web search, GitHub stars, Reddit activity)
2. Revenue model (SaaS, agency, marketplace)
3. Target buyer pain point
4. MVP feature set
5. GitHub-backed examples
6. Legal/clone safety assessment
7. Monetization strategy
8. 48-hour validation approach

Rank opportunities by:
- Business viability (0-20)
- Market size (0-20)
- Revenue evidence (0-15)
- GitHub/OSS readiness (0-15)
- Speed to MVP (0-10)
- Distribution advantage (0-10)
- Competition gap (0-5)
- Legal safety (0-5)
"""
    
    def run_agent_research(self, prompt: str, agent_name: str) -> tuple[str, DebateResult]:
        """Run a single agent's research."""
        try:
            logger.info(f"Running {agent_name} research...")
            agent = self.agents[agent_name]
            result = agent.research(prompt)
            
            if result.error:
                logger.warning(f"{agent_name} returned error: {result.error}")
            else:
                logger.info(f"{agent_name} found {len(result.opportunities)} opportunities")
            
            return agent_name, result
        except Exception as e:
            logger.error(f"Failed to run {agent_name}: {str(e)}")
            result = DebateResult(model=agent.MODEL)
            result.error = str(e)
            return agent_name, result
    
    def run_all_agents(self, prompt: str) -> dict:
        """Run all 4 agents in parallel (or sequential for simplicity)."""
        logger.info("Starting weekly debate across all 4 agents...")
        results = {}
        
        for agent_name in ["grok", "chat", "anthropic", "gemini"]:
            _, result = self.run_agent_research(prompt, agent_name)
            results[agent_name] = result
        
        return results
    
    def generate_output_file(self, consensus: ConsensusResult, debate_results: dict) -> str:
        """Generate the output markdown file."""
        timestamp = datetime.now().strftime("%Y-%m-%d")
        filename = f"WEEKLY_OPPORTUNITIES_{timestamp}.md"
        filepath = self.output_dir / filename
        
        lines = []
        lines.append(f"# PBS Weekly AI Opportunities")
        lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S CET')}")
        lines.append("")
        
        # Executive Summary
        lines.append("## Executive Summary")
        lines.append(f"**Consensus Level:** {consensus.consensus_level:.1%}")
        lines.append(f"**Opportunities Identified:**")
        lines.append(f"  - Unanimous (4/4 agents): {len(consensus.unanimous_items)}")
        lines.append(f"  - Majority (3/4 agents): {len(consensus.agreed_opportunities)}")
        lines.append(f"  - Split (2/2 agents): {len(consensus.split_items)}")
        lines.append("")
        
        # Ranked opportunities
        lines.append("## Ranked Opportunities")
        ranked = self.consensus_engine.rank_by_consensus(consensus)
        
        for idx, opp in enumerate(ranked[:50], 1):  # Top 50
            lines.append(f"\n### {idx}. {opp.name}")
            lines.append(f"**Score:** {opp.avg_score:.1f}/100")
            lines.append(f"**Consensus:** {opp.consensus_type.title()} ({opp.approval_count}/4 agents)")
            lines.append(f"**Target Buyer:** {opp.target_buyer}")
            lines.append(f"**Monetization:** {opp.monetization}")
            lines.append(f"**Evidence:** {opp.evidence}")
            
            if opp.approved_by:
                lines.append(f"**Endorsed By:** {', '.join(opp.approved_by)}")
        
        # Minority opinions
        if consensus.minority_opinions:
            lines.append("\n## Minority Opinions")
            for insight, agents in consensus.minority_opinions.items():
                lines.append(f"- {insight}")
        
        # Raw debate results
        lines.append("\n## Raw Debate Results")
        for agent_name, result in debate_results.items():
            lines.append(f"\n### {agent_name.title()} ({result.model})")
            if result.error:
                lines.append(f"⚠️ Error: {result.error}")
            else:
                lines.append(f"Found {len(result.opportunities)} opportunities")
                lines.append(f"Consensus Ready: {result.consensus_ready}")
        
        # Agent insights
        lines.append("\n## Agent Perspectives")
        agent_perspectives = {
            "grok": "Contrarian/Bold: High-risk, high-reward opportunities",
            "chat": "Pragmatic/Market-Focused: Proven demand and scalability",
            "anthropic": "Balanced/Thoughtful: Legal, ethical, sustainable",
            "gemini": "Innovative/Future-Focused: Emerging trends and multimodal"
        }
        
        for agent_name, perspective in agent_perspectives.items():
            lines.append(f"- **{agent_name.title()}:** {perspective}")
        
        # Consensus report
        lines.append("\n## Detailed Consensus Analysis")
        lines.append(self.consensus_engine.generate_report(consensus))
        
        lines.append("\n---")
        lines.append(f"*Report generated by PBS Weekly Opportunity Runner*")
        
        output = "\n".join(lines)
        
        try:
            with open(filepath, 'w') as f:
                f.write(output)
            logger.info(f"Output file written: {filepath}")
        except Exception as e:
            logger.error(f"Failed to write output file: {str(e)}")
        
        return str(filepath)
    
    def run(self) -> bool:
        """Run the weekly opportunity research."""
        try:
            logger.info("=" * 70)
            logger.info("PBS WEEKLY OPPORTUNITY RESEARCH RUNNER")
            logger.info("=" * 70)
            
            # Load prompt
            prompt = self.load_prompt()
            logger.info(f"Loaded prompt ({len(prompt)} chars)")
            
            # Run all agents
            debate_results = self.run_all_agents(prompt)
            
            # Calculate consensus
            logger.info("Calculating consensus...")
            consensus = self.consensus_engine.calculate_consensus(debate_results)
            
            # Generate output
            output_file = self.generate_output_file(consensus, debate_results)
            
            # Print summary
            logger.info("=" * 70)
            logger.info("CONSENSUS SUMMARY")
            logger.info("=" * 70)
            logger.info(f"Consensus Level: {consensus.consensus_level:.1%}")
            logger.info(f"Unanimous: {len(consensus.unanimous_items)}")
            logger.info(f"Majority: {len(consensus.agreed_opportunities)}")
            logger.info(f"Split: {len(consensus.split_items)}")
            logger.info(f"Output: {output_file}")
            logger.info("=" * 70)
            
            return consensus.consensus_level > 0
        
        except Exception as e:
            logger.error(f"Weekly runner failed: {str(e)}", exc_info=True)
            return False


def main():
    """Main entry point."""
    runner = WeeklyOpportunityRunner()
    success = runner.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
