"""
services/recommendations-service/main.py
Recommendations Service - serve study-group recommendations.
Reads precomputed scores from the recommendations table (written by the ETL/ML pipeline).
Runs on port 8008
"""
from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy.orm import Session

import sys
sys.path.append("/shared")
from shared_models import Recommendation, Group, UserEnrollment, GroupCourse, Base
from shared_database import engine, get_db
from shared_auth import get_current_user

def init_db():
    Base.metadata.create_all(bind=engine)

async def lifespan(app: FastAPI):
    print("🤖 Recommendations Service starting...")
    init_db()
    yield
    print("🛑 Recommendations Service shutting down...")

app = FastAPI(title="StudySync Recommendations Service", version="1.0.0", lifespan=lifespan)

@app.get("/recommendations/health")
async def health():
    return {"status": "ok", "service": "recommendations-service"}

@app.get("/recommendations")
async def get_recommendations(db: Session = Depends(get_db),
                              current_user: dict = Depends(get_current_user)):
    """
    Return ranked group recommendations for the current user.
    If the ML pipeline has written scores, use them. Otherwise fall back to a
    simple live course-overlap computation so the endpoint always returns data.
    """
    user_id = current_user["user_id"]

    # 1. Try precomputed recommendations first
    recs = (db.query(Recommendation)
              .filter(Recommendation.user_id == user_id)
              .order_by(Recommendation.score.desc())
              .limit(10).all())
    if recs:
        results = []
        for r in recs:
            group = db.query(Group).filter(Group.id == r.group_id).first()
            if group:
                results.append({
                    "group_id": str(group.id),
                    "name": group.name,
                    "score": r.score,
                })
        return {"recommendations": results, "source": "ml_pipeline"}

    # 2. Fallback: live course-overlap scoring
    user_courses = {e.course_id for e in
                    db.query(UserEnrollment).filter(UserEnrollment.user_id == user_id).all()}
    if not user_courses:
        return {"recommendations": [], "source": "fallback"}

    scored = []
    for group in db.query(Group).all():
        group_courses = {gc.course_id for gc in
                         db.query(GroupCourse).filter(GroupCourse.group_id == group.id).all()}
        overlap = len(user_courses & group_courses)
        if overlap > 0:
            scored.append({
                "group_id": str(group.id),
                "name": group.name,
                "score": min(overlap * 50, 100),
            })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"recommendations": scored[:10], "source": "fallback"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
