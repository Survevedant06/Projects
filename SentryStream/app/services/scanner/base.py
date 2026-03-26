from enum import Enum
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from typing import Any, Dict

class CheckStatus(str, Enum):
    PASS = "pass"
    WARN = "warn"
    FAIL = "fail"
    ERROR = "error"

@dataclass
class CheckResult:
    check_name: str
    status: CheckStatus
    detail: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "check_name": self.check_name,
            "status": self.status.value,
            "detail": self.detail,
            "metadata": self.metadata,
        }

class BaseChecker(ABC):
    @abstractmethod
    async def run(self, target: str) -> CheckResult:
        """Execute the security check against the target."""
        pass
