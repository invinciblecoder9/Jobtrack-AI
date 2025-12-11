# backend/app/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# THIS LINE IS THE FIX — loads your .env file when running locally!
load_dotenv()

# Now safely get the DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Optional: Helpful error if you forget to set it
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(
        "\nDATABASE_URL not found!\n"
        "Make sure you have a .env file in the backend folder with:\n"
        "DATABASE_URL=postgresql+psycopg://...\n"
        "Or you're running inside Docker with env_file set.\n"
    )

# Create engine — now works both locally and in Docker
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,           # Extra safety for Neon connections
    connect_args={"sslmode": "require"}  # Required for Neon
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()