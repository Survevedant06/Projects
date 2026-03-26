from contextlib import asynccontextmanager
from typing import AsyncGenerator, List, Optional
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, create_engine, SQLModel, select

from app.services.scanner.orchestrator import ScanOrchestrator
from app.services.alerting.webhooks import DiscordAlerter, SlackAlerter
from app.core.config import settings
from app.models import Target, ScanResult
import logging
import asyncio

logger = logging.getLogger(__name__)

# ── Database Setup ────────────────────────────────────────────────────────────
engine = create_engine(settings.DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

# ── WebSocket Connection Manager ──────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self._connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self._connections:
            self._connections.remove(websocket)

    async def broadcast(self, data: dict) -> None:
        dead: list[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            if ws in self._connections:
                self._connections.remove(ws)

manager = ConnectionManager()

# ── Alerting ──────────────────────────────────────────────────────────────────
def get_alerters():
    alerters = []
    if settings.DISCORD_WEBHOOK_URL:
        alerters.append(DiscordAlerter(settings.DISCORD_WEBHOOK_URL))
    if settings.SLACK_WEBHOOK_URL:
        alerters.append(SlackAlerter(settings.SLACK_WEBHOOK_URL))
    return alerters

async def alert_if_unhealthy(scan_event: dict) -> None:
    status = scan_event.get("aggregate_status", "error")
    if status in ("warn", "fail", "error"):
        alerters = get_alerters()
        await asyncio.gather(*[a.send(scan_event) for a in alerters])

# ── Persistence & Broadcast ───────────────────────────────────────────────────
async def publish_scan_event(event: dict) -> None:
    # 1. Broadcast to UI
    await manager.broadcast(event)
    
    # 2. If completed, persist to DB and Alert
    if event.get("event") == "scan_completed":
        # Save results to DB
        with Session(engine) as session:
            target = session.exec(select(Target).where(Target.url == event["target"])).first()
            if target:
                result = ScanResult(
                    target_id=target.id,
                    scan_id=event["scan_id"],
                    aggregate_status=event["aggregate_status"],
                    duration_ms=event["duration_ms"],
                    started_at=datetime.fromisoformat(event["started_at"]),
                    finished_at=datetime.fromisoformat(event["finished_at"]),
                    checks=event["checks"]
                )
                session.add(result)
                target.last_scanned_at = result.finished_at
                target.last_status = result.aggregate_status
                session.add(target)
                session.commit()
        
        # Trigger alerts
        await alert_if_unhealthy(event)

# ── Application lifecycle ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    logger.info("Initializing Database...")
    SQLModel.metadata.create_all(engine)
    yield
    logger.info("Shutting down...")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="SentryStream API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── REST Endpoints ────────────────────────────────────────────────────────────
class TargetCreate(BaseModel):
    url: str
    label: Optional[str] = None

@app.get("/api/v1/targets", response_model=List[Target])
async def list_targets(session: Session = Depends(get_session)):
    return session.exec(select(Target)).all()

@app.post("/api/v1/targets", response_model=Target)
async def create_target(data: TargetCreate, session: Session = Depends(get_session)):
    target = session.exec(select(Target).where(Target.url == data.url)).first()
    if target:
        return target
    target = Target(url=data.url, label=data.label)
    session.add(target)
    session.commit()
    session.refresh(target)
    return target

@app.delete("/api/v1/targets/{target_id}")
async def delete_target(target_id: int, session: Session = Depends(get_session)):
    target = session.get(Target, target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    session.delete(target)
    session.commit()
    return {"message": "Target deleted"}

@app.post("/api/v1/scans", status_code=202)
async def trigger_scan(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    targets = session.exec(select(Target)).all()
    if not targets:
        return {"message": "No targets to scan"}
    
    orchestrator = ScanOrchestrator(publish_fn=publish_scan_event)
    for t in targets:
        import uuid
        scan_id = str(uuid.uuid4())
        background_tasks.add_task(orchestrator.run_scan, t.url, scan_id)

    return {"message": f"Scans queued for {len(targets)} target(s)"}

@app.get("/api/v1/scans/history", response_model=List[ScanResult])
async def get_scan_history(limit: int = 50, session: Session = Depends(get_session)):
    return session.exec(select(ScanResult).order_by(ScanResult.finished_at.desc()).limit(limit)).all()

# ── WebSocket Endpoint ────────────────────────────────────────────────────────
@app.websocket("/ws/scans")
async def websocket_scan_feed(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


