import asyncio
import sys
import os

# Set DATABASE_URL before importing anything
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///backend/ewvlm.db"

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from backend.database import AsyncSessionLocal
from backend.models import Camera
from sqlalchemy import delete

async def restore():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(Camera))
        db.add_all([
            Camera(camera_id='CCTV-0024', name='서측 외곽 울타리', ip_address='192.168.10.124', rtsp_url='rtsp://localhost:8554/CCTV-0024', group_id='g-4', vlm_enabled=1, latitude=37.3949, longitude=127.1110),
            Camera(camera_id='CCTV-0025', name='동측 정문', ip_address='192.168.10.125', rtsp_url='rtsp://localhost:8554/CCTV-0025', group_id='g-1', vlm_enabled=1, latitude=37.3952, longitude=127.1120),
            Camera(camera_id='CCTV-0026', name='북측 자재창고', ip_address='192.168.10.126', rtsp_url='rtsp://localhost:8554/CCTV-0026', group_id='g-3', vlm_enabled=1, latitude=37.3960, longitude=127.1115)
        ])
        await db.commit()

asyncio.run(restore())
