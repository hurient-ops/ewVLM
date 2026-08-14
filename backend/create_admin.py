import asyncio
import sys
sys.path.append('e:\\projects\\ewVLM\\backend')
import crud
from database import AsyncSessionLocal

async def create():
    db = AsyncSessionLocal()
    user = await crud.get_user_by_username(db, 'admin')
    if not user:
        await crud.create_user(db, {
            'username': 'admin',
            'hashed_password': crud.get_password_hash('admin123!'),
            'name': 'Super Admin',
            'phone': '010-0000-0000',
            'role': 'admin'
        })
        print("Admin created!")
    else:
        print("Admin exists.")
    await db.close()

asyncio.run(create())
