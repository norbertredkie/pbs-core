"""
PBS Zombie Monitor
Runs on schedule to kill zombie sub-agents.
CHRO is responsible, but this is the trigger.

Automatically kills any sub-agent that exceeds max_duration_hours.
This prevents resource exhaustion from runaway tasks.
"""
import schedule, time, logging
from pathlib import Path
import sys

# Add parent directory to path to import c_level
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from c_level.src.chro_zombie_killer import CHROZombieKiller

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)


def run_zombie_sweep():
    """
    Kill all zombie sub-agents. Called every 30 minutes.
    
    Returns:
        dict with killed count and health report
    """
    try:
        logger.info("[ZombieMonitor] Starting zombie sweep...")
        chro = CHROZombieKiller()
        
        # Audit all sub-agents
        audit = chro.audit_all_sub_agents()
        logger.info(f"[ZombieMonitor] Audit complete. Total tasks: {audit['total_tasks']}")
        
        # Kill any zombies
        killed = chro.kill_all_zombies()
        
        # Get health report
        health = chro.get_workforce_health()
        
        logger.info(f"[ZombieMonitor] Sweep complete. Killed: {len(killed)}. Health: {health['health_score']}/100 ({health['status']})")
        
        return {
            "killed": len(killed),
            "health": health,
            "timestamp": audit["timestamp"]
        }
    except Exception as e:
        logger.error(f"[ZombieMonitor] ERROR: {e}", exc_info=True)
        return {"error": str(e)}


if __name__ == "__main__":
    logger.info("[ZombieMonitor] PBS Zombie Monitor starting...")
    
    # Run immediately once
    run_zombie_sweep()
    
    # Schedule to run every 30 minutes
    schedule.every(30).minutes.do(run_zombie_sweep)
    
    logger.info("[ZombieMonitor] Scheduled to run every 30 minutes. Entering loop...")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)
    except KeyboardInterrupt:
        logger.info("[ZombieMonitor] Shutting down...")
