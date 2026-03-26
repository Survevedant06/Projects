"""SSL Certificate expiration checker.

Checks the TLS certificate for a given hostname and reports:
  - PASS  → certificate valid for > 30 days
  - WARN  → certificate valid for ≤ 30 days (expiring soon)
  - FAIL  → certificate expired
  - ERROR → could not connect or parse certificate
"""

import asyncio
import ssl
import socket
from datetime import datetime, timezone, timedelta

from app.services.scanner.base import BaseChecker, CheckResult, CheckStatus

# Threshold in days before expiry to trigger a WARN
EXPIRY_WARN_THRESHOLD_DAYS = 30


class SSLChecker(BaseChecker):
    """Asynchronously validates the SSL/TLS certificate for a hostname."""

    def __init__(self, timeout: float = 10.0):
        self._timeout = timeout

    async def run(self, target: str) -> CheckResult:
        hostname = self._extract_hostname(target)
        try:
            cert_info = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(
                    None, self._fetch_cert, hostname
                ),
                timeout=self._timeout,
            )
            return self._evaluate(hostname, cert_info)

        except asyncio.TimeoutError:
            return CheckResult(
                check_name="ssl_certificate",
                status=CheckStatus.ERROR,
                detail=f"Timed out connecting to {hostname}:443",
            )
        except ssl.SSLError as exc:
            return CheckResult(
                check_name="ssl_certificate",
                status=CheckStatus.FAIL,
                detail=f"SSL error: {exc}",
            )
        except (OSError, socket.gaierror) as exc:
            return CheckResult(
                check_name="ssl_certificate",
                status=CheckStatus.ERROR,
                detail=f"Connection error: {exc}",
            )

    # ── Private helpers ────────────────────────────────────────────────────

    @staticmethod
    def _extract_hostname(target: str) -> str:
        """Strip scheme and path so we get a bare hostname."""
        target = target.removeprefix("https://").removeprefix("http://")
        return target.split("/")[0].split(":")[0]

    @staticmethod
    def _fetch_cert(hostname: str) -> dict:
        """Blocking TLS handshake — run inside a thread executor."""
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=10) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as tls_sock:
                return tls_sock.getpeercert()

    @staticmethod
    def _evaluate(hostname: str, cert: dict) -> CheckResult:
        """Parse the notAfter date and decide PASS / WARN / FAIL."""
        not_after_str: str = cert.get("notAfter", "")
        if not not_after_str:
            return CheckResult(
                check_name="ssl_certificate",
                status=CheckStatus.ERROR,
                detail="Could not read certificate expiry date.",
            )

        # ssl module returns dates like: "Jan  1 12:00:00 2026 GMT"
        expiry = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
        expiry = expiry.replace(tzinfo=timezone.utc)
        now = datetime.now(tz=timezone.utc)
        days_remaining = (expiry - now).days

        subject = dict(x[0] for x in cert.get("subject", []))
        common_name = subject.get("commonName", hostname)

        metadata = {
            "hostname": hostname,
            "common_name": common_name,
            "expires_at": expiry.isoformat(),
            "days_remaining": days_remaining,
        }

        if days_remaining < 0:
            return CheckResult(
                check_name="ssl_certificate",
                status=CheckStatus.FAIL,
                detail=f"Certificate EXPIRED {abs(days_remaining)} day(s) ago.",
                metadata=metadata,
            )
        if days_remaining <= EXPIRY_WARN_THRESHOLD_DAYS:
            return CheckResult(
                check_name="ssl_certificate",
                status=CheckStatus.WARN,
                detail=f"Certificate expires in {days_remaining} day(s). Renew soon.",
                metadata=metadata,
            )
        return CheckResult(
            check_name="ssl_certificate",
            status=CheckStatus.PASS,
            detail=f"Certificate valid for {days_remaining} more day(s).",
            metadata=metadata,
        )
