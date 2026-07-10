"""
services/courses-service/main.py
Courses Service - course catalogue and administration.
Runs on port 8006
"""

import json
import os
from uuid import uuid4

import httpx
from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
)
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import sys

sys.path.append("/shared")

from shared_models import Course, Base
from shared_database import engine, get_db
from shared_auth import require_admin, get_current_user
from shared_schemas import (
    CourseCreate,
    CourseResponse,
)


def init_db():
    Base.metadata.create_all(bind=engine)


async def lifespan(app: FastAPI):
    print("📚 Courses Service starting...")
    init_db()
    yield
    print("🛑 Courses Service shutting down...")


app = FastAPI(
    title="StudySync Courses Service",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/courses/health")
async def health():
    return {
        "status": "ok",
        "service": "courses-service"
    }


@app.get(
    "/courses",
    response_model=list[CourseResponse]
)
async def list_courses(
    db: Session = Depends(get_db)
):
    """List all courses."""
    return (
        db.query(Course)
        .order_by(Course.course_code)
        .all()
    )


@app.get(
    "/courses/{course_id}",
    response_model=CourseResponse
)
async def get_course(
    course_id: str,
    db: Session = Depends(get_db)
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


@app.post(
    "/courses",
    response_model=CourseResponse,
    status_code=201
)
async def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Create a course (admin only)."""
    new_course = Course(
        id=uuid4(),
        course_code=course_data.course_code,
        course_name=course_data.course_name,
        department=course_data.department,
    )

    try:
        db.add(new_course)
        db.commit()
        db.refresh(new_course)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Course code already exists"
        )

    return new_course


# ============================================================================
# US-G.5 (extends US-A.1) — AI Onboarding Course Suggestions
# ============================================================================

class OnboardingSuggestionRequest(BaseModel):
    program: str
    year: str


@app.post("/courses/suggest")
async def suggest_onboarding_courses(
    payload: OnboardingSuggestionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    During signup, suggest courses a student is likely enrolled in based on
    their program and year. Suggestions are grounded against the real course
    catalogue only — the model is never allowed to invent a course code that
    doesn't exist, and anything it returns that isn't in our DB gets dropped.
    """
    catalogue = db.query(Course).order_by(Course.course_code).all()
    if not catalogue:
        return {"suggestions": [], "source": "empty_catalogue"}

    catalogue_text = "\n".join(
        f"{c.course_code} — {c.course_name} ({c.department})" for c in catalogue
    )

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        # Onboarding should never block on a missing/unset AI key.
        return {"suggestions": [], "source": "ai_unavailable"}

    prompt = f"""A university student has just signed up for StudySync.
Program: {payload.program}
Year: {payload.year}

Here is the full course catalogue currently offered:
{catalogue_text}

Based on typical curricula for this program and year, pick the course codes
from the catalogue ABOVE ONLY (do not invent new ones) that this student is
most likely enrolled in this term. Return at most 6.

Respond with strict JSON only, in this exact shape:
{{"course_codes": ["CODE1", "CODE2"]}}"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 512,
                    "response_format": {"type": "json_object"},
                },
                timeout=30.0,
            )
    except httpx.RequestError:
        return {"suggestions": [], "source": "ai_unavailable"}

    if response.status_code != 200:
        return {"suggestions": [], "source": "ai_unavailable"}

    try:
        raw_content = response.json()["choices"][0]["message"]["content"]
        suggested_codes = set(json.loads(raw_content).get("course_codes", []))
    except (KeyError, ValueError, json.JSONDecodeError):
        return {"suggestions": [], "source": "ai_unavailable"}

    # Ground-truth check: only ever return courses that actually exist.
    matched = [c for c in catalogue if c.course_code in suggested_codes]

    return {
        "suggestions": [
            {
                "id": str(c.id),
                "course_code": c.course_code,
                "course_name": c.course_name,
                "department": c.department,
            }
            for c in matched
        ],
        "source": "ai",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8006
    )