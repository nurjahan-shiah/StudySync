"""
services/sessions-service/main.py
Sessions Service - schedule and manage study sessions.
Runs on port 8004
"""
from uuid import uuid4
from datetime import datetime
from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy.orm import Session

import sys
sys.path.append("/shared")
from shared_models import StudySession, Group, GroupMembership, GroupMembershipRole, Base
from shared_database import engine, get_db
from shared_auth import get_current_user
from shared_schemas import StudySessionCreate, StudySessionUpdate, StudySessionResponse

def init_db():
    Base.metadata.create_all(bind=engine)

async def lifespan(app: FastAPI):
    print("📅 Sessions Service starting...")
    init_db()
    yield
    print("🛑 Sessions Service shutting down...")

app = FastAPI(title="StudySync Sessions Service", version="1.0.0", lifespan=lifespan)

@app.get("/sessions/health")
async def health():
    return {"status": "ok", "service": "sessions-service"}

@app.get("/groups/{group_id}/sessions", response_model=list[StudySessionResponse])
async def list_sessions(group_id: str, db: Session = Depends(get_db),
                        current_user: dict = Depends(get_current_user)):
    """List all sessions for a group."""
    return (db.query(StudySession)
              .filter(StudySession.group_id == group_id)
              .order_by(StudySession.scheduled_at).all())

@app.post("/groups/{group_id}/sessions", response_model=StudySessionResponse, status_code=201)
async def create_session(group_id: str, data: StudySessionCreate,
                         db: Session = Depends(get_db),
                         current_user: dict = Depends(get_current_user)):
    """Schedule a session (group leader only)."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    membership = (db.query(GroupMembership)
                    .filter(GroupMembership.group_id == group_id,
                            GroupMembership.user_id == current_user["user_id"])
                    .first())
    is_leader = membership and membership.role == GroupMembershipRole.LEADER
    if not is_leader and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only group leaders can schedule sessions")

    new_session = StudySession(
        id=uuid4(),
        group_id=group_id,
        title=data.title,
        scheduled_at=data.scheduled_at,
        location=data.location,
        description=data.description,
        created_by=current_user["user_id"],
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.put("/sessions/{session_id}", response_model=StudySessionResponse)
async def update_session(session_id: str, data: StudySessionUpdate,
                         db: Session = Depends(get_db),
                         current_user: dict = Depends(get_current_user)):
    """Update a session (creator or admin only)."""
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if str(session.created_by) != str(current_user["user_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed to edit this session")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session

@app.delete("/sessions/{session_id}", status_code=204)
async def delete_session(session_id: str, db: Session = Depends(get_db),
                         current_user: dict = Depends(get_current_user)):
    """Delete a session (creator or admin only)."""
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if str(session.created_by) != str(current_user["user_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed to delete this session")
    db.delete(session)
    db.commit()
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
