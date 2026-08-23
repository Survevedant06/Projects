from typing import List, Dict, Any
from app.services.scanner.base import CheckResult, CheckStatus

class RiskEngine:
    """
    The brain of SentryStream.
    Calculates Trust Score and Risk Level from multiple security checks.
    """

    def calculate(self, results: List[CheckResult]) -> Dict[str, Any]:
        """
        Takes raw check results and returns a consolidated Risk Report.
        """
        trust_score = 100
        penalties = 0
        insights = []

        for res in results:
            # Aggregate penalties
            penalties += res.weight
            
            # Generate insights for non-PASS results
            if res.status != CheckStatus.PASS:
                if res.status == CheckStatus.FAIL:
                    insights.append(f"CRITICAL: {res.detail}")
                else:
                    insights.append(f"ADVISORY: {res.detail}")

        # Final score calculation (0-100)
        trust_score = max(0, 100 - penalties)
        
        # Determine Risk Level
        risk_level = "Low"
        if trust_score < 30 or any(r.weight >= 80 for r in results):
            risk_level = "Critical"
        elif trust_score < 60 or any(r.weight >= 40 for r in results):
            risk_level = "High"
        elif trust_score < 85:
            risk_level = "Medium"

        return {
            "trust_score": trust_score,
            "risk_level": risk_level,
            "insights": insights,
            "total_penalties": penalties
        }
