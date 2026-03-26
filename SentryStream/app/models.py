from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel, JSON, Column

class Target(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(index=True, unique=True)
    label: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    last_scanned_at: Optional[datetime] = None
    last_status: Optional[str] = None

    # Relationship to scan results
    results: List["ScanResult"] = Relationship(back_populates="target_rel")

class ScanResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    target_id: int = Field(foreign_key="target.id")
    scan_id: str = Field(index=True)
    aggregate_status: str
    duration_ms: int
    started_at: datetime
    finished_at: datetime
    
    # Store the list of check results as JSON
    checks: List[dict] = Field(default_factory=list, sa_column=Column(JSON))

    target_rel: Target = Relationship(back_populates="results")
