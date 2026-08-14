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

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Integer, default=1)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)
    username = Column(String, index=True, nullable=False)
    action_type = Column(String, nullable=False)
    resource_query = Column(String, nullable=True)
    tx_hash = Column(String, index=True, nullable=False) # Fake blockchain-like hash for realism
    status = Column(String, default="sealed", nullable=False)

class CameraCalibration(Base):
    __tablename__ = "camera_calibration"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, index=True, nullable=False)
    altitude = Column(Float, nullable=False)
    tilt = Column(Float, nullable=False)
    focal_length = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), onupdate=lambda: datetime.datetime.now(datetime.UTC))

class PTZLog(Base):
    __tablename__ = "ptz_logs"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False) # e.g., PAN_LEFT, ZOOM_IN
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)
    user_id = Column(String, nullable=True)
