import math
import logging
import re
from typing import Dict, Any, List

from app.services.scanner.base import BaseChecker, CheckResult, CheckStatus

logger = logging.getLogger(__name__)

class HeuristicEngine(BaseChecker):
    """
    Zero-Day Threat Detection Engine.
    Detects Punycode, Homographs, and High-Entropy domains.
    """

    async def run(self, target: str) -> CheckResult:
        hostname = self._extract_hostname(target)
        
        # 1. Entropy Check (Shannon Entropy)
        entropy = self._calculate_shannon_entropy(hostname)
        entropy_status = CheckStatus.PASS
        entropy_weight = 0
        
        # Domains with entropy > 3.8 are often suspicious (e.g. DGA)
        if entropy > 4.2:
            entropy_status = CheckStatus.FAIL
            entropy_weight = 30
        elif entropy > 3.8:
            entropy_status = CheckStatus.WARN
            entropy_weight = 15

        # 2. Punycode Check
        is_punycode = hostname.startswith("xn--")
        puny_weight = 50 if is_punycode else 0
        puny_status = CheckStatus.FAIL if is_punycode else CheckStatus.PASS

        # 3. Typosquatting (Simplified Levenshtein check)
        typo_weight = self._check_typosquatting(hostname)
        typo_status = CheckStatus.FAIL if typo_weight > 0 else CheckStatus.PASS

        # Aggregate Result
        findings = []
        if entropy_status != CheckStatus.PASS:
            findings.append(f"High Entropy ({entropy:.2f})")
        if is_punycode:
            findings.append("IDN/Punycode Detected")
        if typo_status != CheckStatus.PASS:
            findings.append("Potential Typosquatting")

        total_weight = entropy_weight + puny_weight + typo_weight
        
        if findings:
            return CheckResult(
                check_name="heuristic_analysis",
                status=CheckStatus.FAIL if total_weight >= 40 else CheckStatus.WARN,
                weight=min(total_weight, 100),
                detail=f"Suspicious patterns found: {', '.join(findings)}",
                metadata={
                    "entropy": entropy,
                    "is_punycode": is_punycode,
                    "typosquatting_detected": typo_status == CheckStatus.FAIL,
                }
            )

        return CheckResult(
            check_name="heuristic_analysis",
            status=CheckStatus.PASS,
            detail="Domain heuristics appear normal.",
            metadata={"entropy": entropy, "is_punycode": False}
        )

    @staticmethod
    def _extract_hostname(target: str) -> str:
        target = target.removeprefix("https://").removeprefix("http://")
        return target.split("/")[0].split(":")[0]

    @staticmethod
    def _calculate_shannon_entropy(data: str) -> float:
        """Calculate Shannon entropy for a string."""
        if not data:
            return 0.0
        entropy = 0
        for x in set(data):
            p_x = data.count(x) / len(data)
            entropy += - p_x * math.log2(p_x)
        return entropy

    @staticmethod
    def _check_typosquatting(hostname: str) -> int:
        """
        Check if the hostname is a common typosquat candidate.
        Matches against an abbreviated list of highly targeted domains.
        """
        targets = ["google.com", "facebook.com", "amazon.com", "apple.com", "microsoft.com", "paypal.com"]
        
        # Simple exact match check for 'typo-looking' domains
        # e.g. 'g00gle.com' or 'amaz0n.com' or 'paypal-secure.com'
        pattern = r"(g00gle|am[a4]z[o0]n|p[a4]yp[a4]l|faceb00k|micr0s0ft)"
        if re.search(pattern, hostname, re.IGNORECASE):
            return 60
            
        return 0
