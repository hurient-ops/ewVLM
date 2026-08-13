from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import models
import datetime

async def create_event(db: AsyncSession, event_data: dict):
    # JSON 문자열인 timestamp를 파싱하여 datetime 객체로 변환 (예: "2026-08-12T02:48:55Z")
    ts_str = event_data.get("timestamp")
    if ts_str:
        try:
            ts = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            # SQLite에서는 timezone을 날릴 필요가 있을 수 있으나, 일단 그대로 저장
        except ValueError:
            ts = datetime.datetime.now(datetime.UTC)
    else:
        ts = datetime.datetime.now(datetime.UTC)

    db_event = models.EventLog(
        escalation_id=event_data.get("escalation_id", "unknown"),
        camera_id=event_data.get("camera_id", "unknown"),
        timestamp=ts,
        trigger_class=event_data.get("trigger_class", "unknown"),
        confidence=event_data.get("confidence", 0.0),
        semantic_caption=event_data.get("semantic_caption", ""),
        crop_box_coordinates=event_data.get("crop_box_coordinates", []),
        video_segment_chunk_path=event_data.get("video_segment_chunk_path", "")
    )
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event

async def get_recent_events(db: AsyncSession, limit: int = 50):
    result = await db.execute(
        select(models.EventLog).order_by(desc(models.EventLog.timestamp)).limit(limit)
    )
    return result.scalars().all()
