import httpx
import logging
from bs4 import BeautifulSoup
from typing import Dict, Any, List

from app.services.scanner.base import BaseChecker, CheckResult, CheckStatus

logger = logging.getLogger(__name__)

class DeepScanner(BaseChecker):
    """
    Simulated Deep DOM Analysis.
    Flags suspicious DOM elements such as password fields on HTTP pages or hidden overlays.
    """

    def __init__(self, timeout: float = 15.0):
        self._timeout = timeout

    async def run(self, target: str) -> CheckResult:
        url = self._normalize_url(target)
        is_https = url.startswith("https://")

        try:
            async with httpx.AsyncClient(timeout=self._timeout, follow_redirects=True, verify=False) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    return CheckResult(
                        check_name="deep_scan",
                        status=CheckStatus.ERROR,
                        detail=f"Failed to fetch DOM for deep analysis (HTTP {resp.status_code})",
                    )
                
                return self._analyze_dom(resp.text, is_https)

        except Exception as e:
            logger.error(f"DeepScan error: {e}")
            return CheckResult(
                check_name="deep_scan",
                status=CheckStatus.ERROR,
                detail=f"Deep scan connection error: {e}",
            )

    def _analyze_dom(self, html: str, is_https: bool) -> CheckResult:
        soup = BeautifulSoup(html, "html.parser")
        findings = []
        weight = 0
        status = CheckStatus.PASS

        # 1. Password field on HTTP check
        password_fields = soup.find_all("input", {"type": "password"})
        if password_fields and not is_https:
            findings.append("CRITICAL: Password input detected on non-HTTPS page.")
            weight += 80
            status = CheckStatus.FAIL

        # 2. Suspicious form actions (e.g. data-stealing scripts)
        forms = soup.find_all("form")
        for form in forms:
            action = form.get("action", "")
            if action.startswith("http://") and is_https:
                findings.append("Insecure form submission (HTTP) from an HTTPS page.")
                weight += 30
                status = CheckStatus.WARN

        # 3. Detect large invisible overlays (common in clickjacking)
        # We check for large divs with opacity 0 or absolute positioning covers
        overlays = soup.find_all("div", style=True)
        for div in overlays:
            style = div["style"].lower()
            if "opacity: 0" in style and "z-index" in style:
                findings.append("Potential clickjacking overlay detected (invisible div with z-index).")
                weight += 20
                status = CheckStatus.WARN
                break

        if status != CheckStatus.PASS:
            return CheckResult(
                check_name="deep_scan",
                status=status,
                weight=min(weight, 100),
                detail=" | ".join(findings),
                metadata={"elements_found": len(findings)}
            )

        return CheckResult(
            check_name="deep_scan",
            status=CheckStatus.PASS,
            detail="Advanced DOM analysis found no immediate threats.",
            metadata={"elements_found": 0}
        )

    def _normalize_url(self, target: str) -> str:
        if not target.startswith(("http://", "https://")):
            return f"https://{target}"
        return target
