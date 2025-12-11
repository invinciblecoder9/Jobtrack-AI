from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import jwt
from typing import List

from app.database import get_db
from app.schemas import ApplicationCreate, ApplicationOut
from app.crud import create_application, get_applications, update_application
from app.auth import SECRET_KEY, ALGORITHM
from app.ai import analyze_jd, tailor_resume, analyze_rejection, suggest_jobs, generate_pdf
from app.models import Application, User

# Pydantic models for request bodies (replaces Query params)
from pydantic import BaseModel

class JDAnalysisRequest(BaseModel):
    job_desc: str

class TailorResumeRequest(BaseModel):
    resume: str

class RejectionRequest(BaseModel):
    email: str

router = APIRouter(prefix="/applications", tags=["applications"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


# Dependency to get current authenticated user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# CREATE new application
@router.post("/", response_model=ApplicationOut)
def create_app(
    app: ApplicationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_application(db, app, current_user.id)


# GET all applications for current user
@router.get("/", response_model=List[ApplicationOut])
def get_apps(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_applications(db, current_user.id)


# UPDATE application status (used by Kanban drag-and-drop)
@router.patch("/{app_id}", response_model=ApplicationOut)
def update_app_status(
    app_id: int,
    updates: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    for key, value in updates.items():
        if hasattr(app, key):
            setattr(app, key, value)

    db.commit()
    db.refresh(app)
    return app


# ANALYZE JOB DESCRIPTION (AI)
@router.post("/{app_id}/analyze-jd")
def analyze_app_jd(
    app_id: int,
    payload: JDAnalysisRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    analysis = analyze_jd(payload.job_desc)
    update_application(db, app_id, {
        "job_description": payload.job_desc,
        "notes": analysis
    })
    return {"analysis": analysis}


# TAILOR RESUME (AI)
@router.post("/{app_id}/tailor-resume")
def tailor_app_resume(
    app_id: int,
    payload: TailorResumeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    jd_analysis = app.notes or ""
    suggestions = tailor_resume(payload.resume, jd_analysis)

    update_application(db, app_id, {
        "resume_content": payload.resume,
        "notes": f"{app.notes}\n\n--- TAILORED RESUME ---\n{suggestions}" if app.notes else suggestions
    })
    return {"suggestions": suggestions}


# ANALYZE REJECTION EMAIL (AI)
@router.post("/{app_id}/rejection")
def analyze_rejection_email(
    app_id: int,
    payload: RejectionRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    analysis = analyze_rejection(payload.email)
    update_application(db, app_id, {
        "status": "Rejected",
        "notes": f"{analysis}"
    })
    return {"analysis": analysis}


# SUGGEST JOBS (AI)
@router.get("/suggest-jobs")
def get_job_suggestions(
    user_skills: str = Query(..., description="Comma-separated skills"),
    current_user=Depends(get_current_user)
):
    return {"suggestions": suggest_jobs(user_skills)}

# DELETE application permanently
@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(app)
    db.commit()
    return {"message": "Application deleted forever"}


# EXPORT TAILORED RESUME AS PDF
@router.get("/{app_id}/export-pdf")
def export_pdf(
    app_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found or access denied")

    if not app.resume_content:
        raise HTTPException(status_code=400, detail="No tailored resume found. Run 'Tailor Resume' first.")

    content = f"""
TAILORED RESUME FOR {app.company.upper()} - {app.role.upper()}

Candidate: {current_user.email}
Applied on: {app.date_applied.strftime('%Y-%m-%d') if app.date_applied else 'N/A'}

=== TAILORED RESUME CONTENT ===
{app.resume_content}

=== AI SUGGESTIONS & COVER LETTER ===
{app.notes or 'No AI analysis yet'}
    """.strip()

    pdf_result = generate_pdf(content, filename=f"resume_{app.company}_{app.role}_{app_id}.pdf")

    return {
        "filename": pdf_result["filename"],
        "base64": pdf_result["base64"],
        "message": "PDF generated successfully! Download from frontend."
    }