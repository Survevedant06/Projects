"""HTTP Security Headers checker.

Evaluates the presence and basic correctness of critical security response headers:
  - Strict-Transport-Security (HSTS)
  - Content-Security-Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy

Returns PASS if all required headers are present, WARN if some are missing,
FAIL if the most critical ones (HSTS, CSP) are absent.
"""

import httpx
from dataclasses import dataclass

from app.services.scanner.base import BaseChecker, CheckResult, CheckStatus


@dataclass(frozen=True)
class HeaderSpec:
    name: str
    critical: bool  # FAIL-level if absent
    hint: str       # Developer hint for remediation


# Ordered by security importance
REQUIRED_HEADERS: list[HeaderSpec] = [
    HeaderSpec(
        name="Strict-Transport-Security",
        critical=True,
        hint="Add: Strict-Transport-Security: max-age=31536000; includeSubDomains",
    ),
    HeaderSpec(
        name="Content-Security-Policy",
        critical=True,
        hint="Add a Content-Security-Policy header to prevent XSS.",
    ),
    HeaderSpec(
        name="X-Frame-Options",
        critical=False,
        hint="Add: X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking.",
    ),
    HeaderSpec(
        name="X-Content-Type-Options",
        critical=False,
        hint="Add: X-Content-Type-Options: nosniff",
    ),
    HeaderSpec(
        name="Referrer-Policy",
        critical=False,
        hint="Add: Referrer-Policy: strict-origin-when-cross-origin",
    ),
    HeaderSpec(
        name="Permissions-Policy",
        critical=False,
        hint="Add a Permissions-Policy header to restrict browser feature access.",
    ),
]


class HeaderChecker(BaseChecker):
    """Fetches HTTP response headers and validates security posture."""

    def __init__(self, timeout: float = 15.0):
        self._timeout = timeout

    async def run(self, target: str) -> CheckResult:
        url = self._normalize_url(target)
        try:
            async with httpx.AsyncClient(
                timeout=self._timeout,
                follow_redirects=True,
                verify=False,  # We check SSL separately; don't block on cert errors here
            ) as client:
                response = await client.head(url)
                return self._evaluate(url, dict(response.headers))

        except httpx.TimeoutException:
            return CheckResult(
                check_name="security_headers",
                status=CheckStatus.ERROR,
                detail=f"Timed out fetching headers from {url}",
            )
        except httpx.RequestError as exc:
            return CheckResult(
                check_name="security_headers",
                status=CheckStatus.ERROR,
                detail=f"Request failed: {exc}",
            )

    # ── Private helpers ────────────────────────────────────────────────────

    @staticmethod
    def _normalize_url(target: str) -> str:
        if not target.startswith(("http://", "https://")):
            return f"https://{target}"
        return target

    @staticmethod
    def _evaluate(url: str, headers: dict[str, str]) -> CheckResult:
        # Normalise header names to lowercase for case-insensitive comparison
        lower_headers = {k.lower(): v for k, v in headers.items()}

        missing_critical: list[str] = []
        missing_non_critical: list[str] = []
        present: list[str] = []
        hints: list[str] = []

        for spec in REQUIRED_HEADERS:
            if spec.name.lower() in lower_headers:
                present.append(spec.name)
            else:
                if spec.critical:
                    missing_critical.append(spec.name)
                else:
                    missing_non_critical.append(spec.name)
                hints.append(spec.hint)

        metadata = {
            "url": url,
            "present": present,
            "missing_critical": missing_critical,
            "missing_non_critical": missing_non_critical,
            "remediation_hints": hints,
            "score": f"{len(present)}/{len(REQUIRED_HEADERS)}",
        }

        if missing_critical:
            return CheckResult(
                check_name="security_headers",
                status=CheckStatus.FAIL,
                detail=(
                    f"Missing {len(missing_critical)} critical header(s): "
                    f"{', '.join(missing_critical)}"
                ),
                metadata=metadata,
            )
        if missing_non_critical:
            return CheckResult(
                check_name="security_headers",
                status=CheckStatus.WARN,
                detail=(
                    f"Missing {len(missing_non_critical)} recommended header(s): "
                    f"{', '.join(missing_non_critical)}"
                ),
                metadata=metadata,
            )
        return CheckResult(
            check_name="security_headers",
            status=CheckStatus.PASS,
            detail=f"All {len(REQUIRED_HEADERS)} security headers present.",
            metadata=metadata,
        )
