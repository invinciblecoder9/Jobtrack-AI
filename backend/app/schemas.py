from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ApplicationCreate(BaseModel):
    company: str
    role: str
    date_applied: datetime
    job_description: Optional[str] = None
    resume_content: Optional[str] = None

class ApplicationOut(BaseModel):
    id: int
    company: str
    role: str
    date_applied: datetime
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True 