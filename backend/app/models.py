from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company = Column(String)
    role = Column(String)
    date_applied = Column(DateTime)
    status = Column(String, default="Applied")  # Applied, Interview, Rejected, etc.
    job_description = Column(Text)
    resume_content = Column(Text)  # Stored as text for AI processing
    notes = Column(Text)