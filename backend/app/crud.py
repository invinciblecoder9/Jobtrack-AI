from sqlalchemy.orm import Session
from .models import User, Application
from .schemas import UserCreate, ApplicationCreate
from .auth import get_password_hash
from app import models, schemas, auth

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)  # Now 100% safe
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_application(db: Session, app: ApplicationCreate, user_id: int):
    db_app = Application(**app.dict(), user_id=user_id)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def get_applications(db: Session, user_id: int):
    return db.query(Application).filter(Application.user_id == user_id).all()

def update_application(db: Session, app_id: int, updates: dict):
    db_app = db.query(Application).filter(Application.id == app_id).first()
    for key, value in updates.items():
        setattr(db_app, key, value)
    db.commit()
    db.refresh(db_app)
    return db_app