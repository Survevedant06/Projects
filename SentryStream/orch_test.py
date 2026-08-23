import asyncio
import sys
import os

# Add current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from app.services.scanner.orchestrator import ScanOrchestrator

async def test():
    orch = ScanOrchestrator()
    # This should trigger the 'phish' mock match in IntelligenceChecker
    # and the entropy warning in Heuristics
    target = "https://phish-test-secure-login.com" 
    print(f"Testing target: {target}")
    
    result = await orch.run_scan(target)
    
    print("-" * 40)
    print(f"TRUST SCORE: {result['trust_score']}")
    print(f"RISK LEVEL:  {result['risk_level']}")
    print("-" * 40)
    print("INSIGHTS:")
    for insight in result['insights']:
        print(f"  - {insight}")
    print("-" * 40)
    
    # Verify we have the new checkers in the results
    check_names = [c['check_name'] for c in result['checks']]
    print(f"Checkers executed: {', '.join(check_names)}")

if __name__ == "__main__":
    asyncio.run(test())
