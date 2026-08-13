from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from database import Base
import datetime

class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    escalation_id = Column(String, index=True, nullable=False)
    camera_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)
    trigger_class = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    semantic_caption = Column(String, nullable=True)
    crop_box_coordinates = Column(JSON, nullable=True)
    video_segment_chunk_path = Column(String, nullable=True)
