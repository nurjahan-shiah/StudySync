"""
services/admin-service/main.py
Admin Service - user/course/group management and moderation.
Runs on port 8007
"""
from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy.orm import Session

import sys
sys.path.append("/shared")
from shared_models import User, Group, Resource, Base
from shared_database import engine, get_db
from shared_auth import get_current_user
from shared_schemas import UserProfile

def init_db():
    Base.metadata.create_all(bind=engine)

async def lifespan(app: FastAPI):
    print("⚙️  Admin Service starting...")
    init_db()
    yield
    print("🛑 Admin Service shutting down...")

app = FastAPI(title="StudySync Admin Service", version="1.0.0", lifespan=lifespan)

def require_admin(current_user: dict):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

@app.get("/admin/health")
async def health():
    return {"status": "ok", "service": "admin-service"}

@app.get("/admin/users", response_model=list[UserProfile])
async def list_users(db: Session = Depends(get_db),
                     current_user: dict = Depends(get_current_user)):
    """List all users (admin only)."""
    require_admin(current_user)
    return db.query(User).order_by(User.created_at.desc()).all()

@app.put("/admin/users/{user_id}/role")
async def change_user_role(user_id: str, role: str, db: Session = Depends(get_db),
                           current_user: dict = Depends(get_current_user)):
    """Change a user's role (admin only)."""
    require_admin(current_user)
    if role not in ("student", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(user.id) == str(current_user["user_id"]) and role != "admin":
        raise HTTPException(status_code=400, detail="Cannot demote your own account")
    user.role = role
    db.commit()
    return {"status": "updated", "user_id": user_id, "role": role}

@app.delete("/admin/users/{user_id}", status_code=204)
async def deactivate_user(user_id: str, db: Session = Depends(get_db),
                          current_user: dict = Depends(get_current_user)):
    """Delete/deactivate a user (admin only)."""
    require_admin(current_user)
    if str(user_id) == str(current_user["user_id"]):
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return None

@app.delete("/admin/groups/{group_id}", status_code=204)
async def delete_group(group_id: str, db: Session = Depends(get_db),
                       current_user: dict = Depends(get_current_user)):
    """Delete any group (admin moderation)."""
    require_admin(current_user)
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(group)
    db.commit()
    return None

@app.delete("/admin/resources/{resource_id}", status_code=204)
async def delete_resource(resource_id: str, db: Session = Depends(get_db),
                          current_user: dict = Depends(get_current_user)):
    """Delete any resource (admin moderation)."""
    require_admin(current_user)
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)
