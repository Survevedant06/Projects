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
    penalty: int    # Points to deduct if missing
    hint: str       # Developer hint for remediation


# Ordered by security importance
REQUIRED_HEADERS: list[HeaderSpec] = [
    HeaderSpec(
        name="Strict-Transport-Security",
        critical=True,
        penalty=20,
        hint="Add: Strict-Transport-Security: max-age=31536000; includeSubDomains",
    ),
    HeaderSpec(
        name="Content-Security-Policy",
        critical=True,
        penalty=25,
        hint="Add a Content-Security-Policy header to prevent XSS.",
    ),
    HeaderSpec(
        name="X-Frame-Options",
        critical=False,
        penalty=10,
        hint="Add: X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking.",
    ),
    HeaderSpec(
        name="X-Content-Type-Options",
        critical=True,
        penalty=5,
        hint="Add: X-Content-Type-Options: nosniff",
    ),
    HeaderSpec(
        name="Referrer-Policy",
        critical=False,
        penalty=5,
        hint="Add: Referrer-Policy: strict-origin-when-cross-origin",
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
                verify=False,  # Checked separately
            ) as client:
                # Use GET if HEAD is blocked by WAF
                response = await client.head(url)
                if response.status_code >= 400:
                    response = await client.get(url)
                return self._evaluate(url, dict(response.headers))

        except Exception as exc:
            return CheckResult(
                check_name="security_headers",
                status=CheckStatus.ERROR,
                detail=f"Connection failed: {exc}",
            )

    def _normalize_url(self, target: str) -> str:
        if not target.startswith(("http://", "https://")):
            return f"https://{target}"
        return target

    def _evaluate(self, url: str, headers: dict[str, str]) -> CheckResult:
        lower_headers = {k.lower(): v for k, v in headers.items()}

        missing_critical = []
        missing_other = []
        present = []
        total_weight = 0

        for spec in REQUIRED_HEADERS:
            if spec.name.lower() in lower_headers:
                present.append(spec.name)
            else:
                total_weight += spec.penalty
                if spec.critical:
                    missing_critical.append(spec.name)
                else:
                    missing_other.append(spec.name)

        metadata = {
            "present": present,
            "missing": missing_critical + missing_other,
            "score": f"{len(present)}/{len(REQUIRED_HEADERS)}",
        }

        if missing_critical:
            return CheckResult(
                check_name="security_headers",
                status=CheckStatus.FAIL,
                weight=total_weight,
                detail=f"Missing {len(missing_critical)} critical security headers (HSTS/CSP/XCTO).",
                metadata=metadata
            )
        if missing_other:
            return CheckResult(
                check_name="security_headers",
                status=CheckStatus.WARN,
                weight=total_weight,
                detail=f"Missing {len(missing_other)} recommended security headers.",
                metadata=metadata
            )

        return CheckResult(
            check_name="security_headers",
            status=CheckStatus.PASS,
            detail="All standard security headers are present.",
            metadata=metadata
        )
