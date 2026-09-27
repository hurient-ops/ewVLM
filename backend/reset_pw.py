import asyncio
import sys
import os

sys.path.append('e:\\projects\\ewVLM\\backend')
import crud
from database import AsyncSessionLocal

async def reset_password():
    db = AsyncSessionLocal()
    user = await crud.get_user_by_username(db, "admin")
    if user:
        user.hashed_password = crud.get_password_hash("admin123!")
        db.add(user)
        await db.commit()
        print("Admin password updated successfully!")
    else:
        print("Admin user not found!")
    await db.close()

if __name__ == "__main__":
    asyncio.run(reset_password())
