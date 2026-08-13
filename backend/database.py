import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

# Fallback to SQLite (Mock mode without Docker)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ewvlm.db")

engine = create_async_engine(
    DATABASE_URL, 
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
