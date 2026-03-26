"""Open port scanner.

Uses asyncio's low-level connection primitives to concurrently probe
a set of common ports. No external tools (nmap) required.

Ports checked by default:
  22   → SSH (WARN if open on public-facing servers)
  80   → HTTP (INFO — expected)
  443  → HTTPS (INFO — expected)
  8080 → HTTP alt (WARN — dev port exposed?)
  3306 → MySQL  (FAIL if open externally)
  5432 → PostgreSQL (FAIL if open externally)
  6379 → Redis (FAIL if open externally)
"""

import asyncio
from dataclasses import dataclass

from app.services.scanner.base import BaseChecker, CheckResult, CheckStatus


@dataclass(frozen=True)
class PortSpec:
    port: int
    service: str
    severity: CheckStatus  # Status to use if port is OPEN (not expected to be)
    expected_open: bool     # True → finding it open is normal


PORT_SPECS: list[PortSpec] = [
    PortSpec(80,   "HTTP",       CheckStatus.PASS, expected_open=True),
    PortSpec(443,  "HTTPS",      CheckStatus.PASS, expected_open=True),
    PortSpec(22,   "SSH",        CheckStatus.WARN, expected_open=False),
    PortSpec(8080, "HTTP-alt",   CheckStatus.WARN, expected_open=False),
    PortSpec(3306, "MySQL",      CheckStatus.FAIL, expected_open=False),
    PortSpec(5432, "PostgreSQL", CheckStatus.FAIL, expected_open=False),
    PortSpec(6379, "Redis",      CheckStatus.FAIL, expected_open=False),
]

CONCURRENT_LIMIT = 10   # semaphore cap to avoid socket exhaustion
CONNECT_TIMEOUT = 3.0   # seconds per port


class PortChecker(BaseChecker):
    """Concurrently probes a set of ports and surfaces unexpected open ports."""

    async def run(self, target: str) -> CheckResult:
        hostname = self._strip_scheme(target)
        semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)

        tasks = [
            self._probe_port(hostname, spec, semaphore)
            for spec in PORT_SPECS
        ]
        results: list[dict] = await asyncio.gather(*tasks)

        open_dangerous = [r for r in results if r["open"] and not r["expected_open"]]
        open_expected  = [r for r in results if r["open"] and r["expected_open"]]
        closed         = [r for r in results if not r["open"]]

        metadata = {
            "hostname": hostname,
            "open_ports": [r for r in results if r["open"]],
            "closed_ports": [r["port"] for r in closed],
        }

        if any(r["severity"] == CheckStatus.FAIL.value for r in open_dangerous):
            worst = [r for r in open_dangerous if r["severity"] == CheckStatus.FAIL.value]
            return CheckResult(
                check_name="open_ports",
                status=CheckStatus.FAIL,
                detail=(
                    f"CRITICAL: Database/cache port(s) exposed — "
                    f"{', '.join(str(r['port']) for r in worst)}"
                ),
                metadata=metadata,
            )
        if open_dangerous:
            port_strings = [f"{r['port']}/{r['service']}" for r in open_dangerous]
            return CheckResult(
                check_name="open_ports",
                status=CheckStatus.WARN,
                detail=f"Unexpected port(s) open: {', '.join(port_strings)}",
                metadata=metadata,
            )
        return CheckResult(
            check_name="open_ports",
            status=CheckStatus.PASS,
            detail=f"Only expected port(s) open: {[r['port'] for r in open_expected]}",
            metadata=metadata,
        )

    # ── Private helpers ────────────────────────────────────────────────────

    @staticmethod
    def _strip_scheme(target: str) -> str:
        return target.removeprefix("https://").removeprefix("http://").split("/")[0].split(":")[0]

    @staticmethod
    async def _probe_port(
        hostname: str,
        spec: PortSpec,
        semaphore: asyncio.Semaphore,
    ) -> dict:
        async with semaphore:
            try:
                _, writer = await asyncio.wait_for(
                    asyncio.open_connection(hostname, spec.port),
                    timeout=CONNECT_TIMEOUT,
                )
                writer.close()
                await writer.wait_closed()
                is_open = True
            except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
                is_open = False

        return {
            "port": spec.port,
            "service": spec.service,
            "open": is_open,
            "expected_open": spec.expected_open,
            "severity": spec.severity.value,
        }
