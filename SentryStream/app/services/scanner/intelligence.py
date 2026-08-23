import httpx
import logging
from typing import Dict, Any, List

from app.services.scanner.base import BaseChecker, CheckResult, CheckStatus
from app.core.config import settings

logger = logging.getLogger(__name__)

class IntelligenceChecker(BaseChecker):
    """
    Threat Intelligence Aggregator.
    Queries VirusTotal and Google Safe Browsing to detect known malicious URLs.
    """

    def __init__(self, timeout: float = 10.0):
        self._timeout = timeout
        self._vt_url = "https://www.virustotal.com/api/v3/urls"
        self._gsb_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.GOOGLE_SAFE_BROWSING_API_KEY}"

    async def run(self, target: str) -> CheckResult:
        findings = []
        total_weight = 0
        status = CheckStatus.PASS

        # 1. VirusTotal Check
        vt_result = await self._check_virustotal(target)
        if vt_result["status"] == CheckStatus.FAIL:
            status = CheckStatus.FAIL
            total_weight += vt_result["weight"]
            findings.append(f"VirusTotal: {vt_result['detail']}")

        # 2. Google Safe Browsing Check
        gsb_result = await self._check_safe_browsing(target)
        if gsb_result["status"] == CheckStatus.FAIL:
            status = CheckStatus.FAIL
            total_weight += gsb_result["weight"]
            findings.append(f"Google Safe Browsing: {gsb_result['detail']}")

        if status == CheckStatus.FAIL:
            return CheckResult(
                check_name="threat_intelligence",
                status=CheckStatus.FAIL,
                weight=min(total_weight, 100), # Cap penalty
                detail=" | ".join(findings),
                metadata={"vt": vt_result, "gsb": gsb_result}
            )

        return CheckResult(
            check_name="threat_intelligence",
            status=CheckStatus.PASS,
            detail="No malicious signals detected by TI vendors.",
            metadata={"vt": vt_result, "gsb": gsb_result}
        )

    async def _check_virustotal(self, target: str) -> Dict[str, Any]:
        if not settings.VIRUSTOTAL_API_KEY:
            return {"status": CheckStatus.PASS, "detail": "API Key missing (skipped)", "weight": 0}

        headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                # We use the 'url' as the identifier. VT often requires base64 encoding it.
                import base64
                url_id = base64.urlsafe_b64encode(target.encode()).decode().strip("=")
                resp = await client.get(f"{self._vt_url}/{url_id}", headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    stats = data["data"]["attributes"]["last_analysis_stats"]
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)

                    if malicious > 0:
                        return {
                            "status": CheckStatus.FAIL,
                            "detail": f"Flagged as malicious by {malicious} vendors.",
                            "weight": 80 if malicious > 3 else 40
                        }
                    if suspicious > 0:
                        return {
                            "status": CheckStatus.WARN,
                            "detail": f"Flagged as suspicious by {suspicious} vendors.",
                            "weight": 20
                        }
                
                return {"status": CheckStatus.PASS, "detail": "Clean", "weight": 0}

        except Exception as e:
            logger.error(f"VirusTotal error: {e}")
            return {"status": CheckStatus.ERROR, "detail": str(e), "weight": 0}

    async def _check_safe_browsing(self, target: str) -> Dict[str, Any]:
        if not settings.GOOGLE_SAFE_BROWSING_API_KEY or "MOCK" in settings.GOOGLE_SAFE_BROWSING_API_KEY:
            # Mock behavior for competition if key is MOCK or missing
            if "malicious" in target or "phish" in target:
                return {
                    "status": CheckStatus.FAIL, 
                    "detail": "MALWARE detected (Mock Result)", 
                    "weight": 100
                }
            return {"status": CheckStatus.PASS, "detail": "Clean (Mock)", "weight": 0}

        payload = {
            "client": {"clientId": "sentrystream", "clientVersion": "1.0.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": target}]
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                resp = await client.post(self._gsb_url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    if "matches" in data:
                        threat_type = data["matches"][0]["threatType"]
                        return {
                            "status": CheckStatus.FAIL,
                            "detail": f"Flagged as {threat_type} by Google.",
                            "weight": 100
                        }
                return {"status": CheckStatus.PASS, "detail": "Clean", "weight": 0}
        except Exception as e:
            logger.error(f"GSB error: {e}")
            return {"status": CheckStatus.ERROR, "detail": str(e), "weight": 0}
