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
    embedding = Column(JSON, nullable=True) # [NEW] SQLite 호환 인메모리 검색용 벡터 배열

class CameraGroup(Base):
    __tablename__ = "camera_groups"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    rtsp_url = Column(String, nullable=True)
    group_id = Column(String, nullable=True)
    vlm_enabled = Column(Integer, default=1) # 1 for True, 0 for False
    latitude = Column(Float, nullable=False, default=0.0)
    longitude = Column(Float, nullable=False, default=0.0)
    is_active = Column(Integer, default=1)

class VideoRecord(Base):
    __tablename__ = "video_records"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, index=True, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    file_path = Column(String, nullable=False)
    event_tags = Column(JSON, nullable=True)

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

class PtzSchedule(Base):
    __tablename__ = "ptz_schedules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    camera_id = Column(String, nullable=False)
    schedule_data = Column(JSON, nullable=False) # Store the chain nodes and schedule grid
    is_active = Column(Integer, default=1)

class MLOpsJob(Base):
    __tablename__ = "mlops_jobs"
    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False)
    target_model = Column(String, nullable=False)
    status = Column(String, default="PENDING", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)
    completed_at = Column(DateTime, nullable=True)

class PromptDeployment(Base):
    __tablename__ = "prompt_deployments"
    id = Column(Integer, primary_key=True, index=True)
    target_edge_id = Column(String, nullable=False)
    action_type = Column(String, nullable=False)
    status = Column(String, default="SUCCESS", nullable=False)
    payload_json = Column(JSON, nullable=True) # [NEW] 프롬프트 엔진 템플릿(시스템 프롬프트, 사용자 프롬프트 템플릿)
    deployed_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)

class SOPRule(Base):
    __tablename__ = "sop_rules"
    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String, unique=True, index=True, nullable=False)
    natural_language_prompt = Column(String, nullable=False)
    target_object = Column(String, nullable=False)
    confidence_threshold = Column(Float, default=0.85, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)

class ExportJob(Base):
    __tablename__ = "export_jobs"
    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False)
    target_cameras = Column(String, nullable=False)
    status = Column(String, default="PENDING", nullable=False)
    download_url = Column(String, nullable=True)
    requested_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)
    completed_at = Column(DateTime, nullable=True)

class NvrNode(Base):
    __tablename__ = "nvr_nodes"
    id = Column(Integer, primary_key=True, index=True)
    node_name = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    role = Column(String, nullable=False) # e.g., PRIMARY, FAILOVER
    status = Column(String, default="ACTIVE", nullable=False)
    cpu_usage = Column(Float, default=0.0)
    ram_usage = Column(Float, default=0.0)
    storage_total_tb = Column(Float, default=0.0)
    storage_used_tb = Column(Float, default=0.0)
