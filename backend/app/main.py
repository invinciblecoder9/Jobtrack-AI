from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, applications
from app.database import engine, Base  # ← import engine and Base

app = FastAPI(title="JobTrack AI", description="AI-Powered Job Tracker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(applications.router)

@app.get("/")
def root():
    return {"message": "JobTrack AI Backend is running!"}

# THIS IS THE CORRECT PLACE TO CREATE TABLES
from app import models
Base.metadata.create_all(bind=engine)