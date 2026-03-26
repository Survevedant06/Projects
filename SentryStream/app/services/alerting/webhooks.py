"""Alerting services — Discord and Slack webhook integrations.

Both services share the same abstract interface (AlertChannel) so they
can be swapped or composed without changing the calling code.
"""

import logging
from abc import ABC, abstractmethod

import httpx

logger = logging.getLogger(__name__)

# Status → emoji mapping for rich alert messages
STATUS_EMOJI = {
    "fail":  "🔴",
    "warn":  "🟡",
    "pass":  "🟢",
    "error": "⚫",
}


class AlertChannel(ABC):
    """Every alert destination must implement `send`."""

    @abstractmethod
    async def send(self, scan_event: dict) -> None:
        raise NotImplementedError


# ─────────────────────────────────────────────────────────────────────────────
# Discord
# ─────────────────────────────────────────────────────────────────────────────

class DiscordAlerter(AlertChannel):
    """Sends a rich Discord embed when a scan returns WARN or FAIL."""

    def __init__(self, webhook_url: str):
        self._webhook_url = webhook_url

    async def send(self, scan_event: dict) -> None:
        status = scan_event.get("aggregate_status", "error")
        emoji = STATUS_EMOJI.get(status, "⚫")
        color = {"fail": 0xE74C3C, "warn": 0xF39C12, "pass": 0x2ECC71}.get(status, 0x95A5A6)

        fields = [
            {
                "name": f"`{check['check_name']}`",
                "value": f"{STATUS_EMOJI.get(check['status'], '⚫')} {check['detail']}",
                "inline": False,
            }
            for check in scan_event.get("checks", [])
        ]

        payload = {
            "embeds": [
                {
                    "title": f"{emoji} Security Scan — {scan_event.get('target')}",
                    "description": (
                        f"**Overall Status:** `{status.upper()}`\n"
                        f"**Scan ID:** `{scan_event.get('scan_id')}`\n"
                        f"**Duration:** {scan_event.get('duration_ms')}ms"
                    ),
                    "color": color,
                    "fields": fields,
                    "timestamp": scan_event.get("finished_at"),
                    "footer": {"text": "Security & Compliance Monitor"},
                }
            ]
        }

        await self._post(payload)

    async def _post(self, payload: dict) -> None:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self._webhook_url, json=payload)
            if resp.status_code not in (200, 204):
                logger.error("Discord webhook failed: %s %s", resp.status_code, resp.text)


# ─────────────────────────────────────────────────────────────────────────────
# Slack
# ─────────────────────────────────────────────────────────────────────────────

class SlackAlerter(AlertChannel):
    """Sends a Slack Block Kit message via Incoming Webhook."""

    def __init__(self, webhook_url: str):
        self._webhook_url = webhook_url

    async def send(self, scan_event: dict) -> None:
        status = scan_event.get("aggregate_status", "error")
        emoji = STATUS_EMOJI.get(status, "⚫")

        check_lines = "\n".join(
            f"• `{c['check_name']}` — {STATUS_EMOJI.get(c['status'], '⚫')} {c['detail']}"
            for c in scan_event.get("checks", [])
        )

        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"{emoji} Security Alert: {scan_event.get('target')}",
                    },
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Status:*\n`{status.upper()}`"},
                        {"type": "mrkdwn", "text": f"*Duration:*\n{scan_event.get('duration_ms')}ms"},
                    ],
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"*Check Results:*\n{check_lines}"},
                },
                {"type": "divider"},
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": f"Scan ID: `{scan_event.get('scan_id')}` | {scan_event.get('finished_at')}",
                        }
                    ],
                },
            ]
        }

        await self._post(payload)

    async def _post(self, payload: dict) -> None:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self._webhook_url, json=payload)
            if resp.status_code != 200:
                logger.error("Slack webhook failed: %s %s", resp.status_code, resp.text)
