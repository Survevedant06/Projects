"""Scan Orchestrator.

Coordinates all checkers for a given target, computes an aggregate health
score, persists results, and publishes real-time events over WebSocket.

Flow:
  1. Receive ScanJob (target URL/IP + scan_id)
  2. Run all checkers concurrently via asyncio.gather
  3. Compute aggregate status (worst individual status wins)
  4. Persist ScanResult to the database
  5. Publish event to Redis → consumed by WS broadcaster
  6. Trigger alerting service if status is WARN or FAIL
"""

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Callable, Awaitable

from app.services.scanner.base import CheckResult, CheckStatus
from app.services.scanner.ssl_checker import SSLChecker
from app.services.scanner.header_checker import HeaderChecker
from app.services.scanner.port_checker import PortChecker

logger = logging.getLogger(__name__)

# Type alias for the WS publish callback
PublishFn = Callable[[dict], Awaitable[None]]


class ScanOrchestrator:
    """Runs all registered checkers against a target and emits structured events."""

    def __init__(self, publish_fn: PublishFn | None = None):
        """
        Args:
            publish_fn: Async callback that receives the final ScanEvent dict.
                        Typically wires to a Redis publisher or WS broadcast.
        """
        self._checkers = [
            SSLChecker(),
            HeaderChecker(),
            PortChecker(),
        ]
        self._publish = publish_fn or self._default_publish

    async def run_scan(self, target: str, scan_id: str | None = None) -> dict:
        """
        Execute all checkers for `target` concurrently.

        Returns:
            A serializable ScanEvent dict suitable for DB persistence and WS broadcast.
        """
        scan_id = scan_id or str(uuid.uuid4())
        started_at = datetime.now(tz=timezone.utc)

        logger.info("Starting scan id=%s target=%s", scan_id, target)

        # Emit "scan started" event so the UI can show a spinner immediately
        await self._publish({
            "event": "scan_started",
            "scan_id": scan_id,
            "target": target,
            "timestamp": started_at.isoformat(),
        })

        # Run all checkers concurrently — each is independent and won't block the others
        check_results: list[CheckResult] = await asyncio.gather(
            *[checker.run(target) for checker in self._checkers],
            return_exceptions=False,
        )

        finished_at = datetime.now(tz=timezone.utc)
        aggregate_status = self._aggregate_status(check_results)

        scan_event = {
            "event": "scan_completed",
            "scan_id": scan_id,
            "target": target,
            "aggregate_status": aggregate_status.value,
            "duration_ms": int((finished_at - started_at).total_seconds() * 1000),
            "started_at": started_at.isoformat(),
            "finished_at": finished_at.isoformat(),
            "checks": [r.to_dict() for r in check_results],
        }

        logger.info(
            "Scan completed id=%s target=%s status=%s duration_ms=%d",
            scan_id,
            target,
            aggregate_status.value,
            scan_event["duration_ms"],
        )

        # Broadcast to WebSocket clients
        await self._publish(scan_event)

        return scan_event

    # ── Private helpers ────────────────────────────────────────────────────

    @staticmethod
    def _aggregate_status(results: list[CheckResult]) -> CheckStatus:
        """Worst status across all checks determines the overall health.

        Priority: FAIL > ERROR > WARN > PASS
        """
        priority = {
            CheckStatus.FAIL:  4,
            CheckStatus.ERROR: 3,
            CheckStatus.WARN:  2,
            CheckStatus.PASS:  1,
        }
        return max(results, key=lambda r: priority.get(r.status, 0)).status

    @staticmethod
    async def _default_publish(event: dict) -> None:
        """Fallback no-op publisher — useful in unit tests."""
        logger.debug("ScanEvent (no publisher configured): %s", event.get("event"))
