"""
Webhook system for account lifecycle events
"""
import os
import httpx
import logging
from datetime import datetime, timezone
from .models import WebhookEvent

logger = logging.getLogger(__name__)


WEBHOOK_ENDPOINTS = {
    "user.created": os.getenv("WEBHOOK_USER_CREATED", ""),
    "user.updated": os.getenv("WEBHOOK_USER_UPDATED", ""),
    "user.deleted": os.getenv("WEBHOOK_USER_DELETED", ""),
}


async def send_webhook(event_type: str, event: WebhookEvent):
    """
    Send webhook event to registered endpoint
    
    Args:
        event_type: Event type (user.created, user.updated, user.deleted)
        event: WebhookEvent object
    """
    endpoint = WEBHOOK_ENDPOINTS.get(event_type)
    if not endpoint:
        logger.debug(f"No webhook endpoint configured for {event_type}")
        return
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                endpoint,
                json=event.dict(),
                headers={
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": generate_signature(event),
                }
            )
            response.raise_for_status()
            logger.info(f"Webhook {event_type} sent successfully to {endpoint}")
    except Exception as e:
        logger.error(f"Failed to send webhook {event_type}: {e}")
        # In production, implement retry logic with exponential backoff
        # or store failed webhooks for later retry


def generate_signature(event: WebhookEvent) -> str:
    """
    Generate HMAC signature for webhook verification
    Clients can verify webhook authenticity using this signature
    """
    import hmac
    import hashlib
    import json
    
    secret = os.getenv("WEBHOOK_SECRET", "")
    payload = json.dumps(event.dict(), sort_keys=True)
    signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return signature
