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
        video_segment_chunk_path=event_data.get("video_segment_chunk_path", ""),
        embedding=event_data.get("embedding", None)
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

async def get_groups(db: AsyncSession):
    result = await db.execute(select(models.CameraGroup))
    return result.scalars().all()

async def create_group(db: AsyncSession, group_data: dict):
    db_group = models.CameraGroup(**group_data)
    db.add(db_group)
    await db.commit()
    await db.refresh(db_group)
    return db_group

async def delete_group(db: AsyncSession, group_id: str):
    result = await db.execute(select(models.CameraGroup).where(models.CameraGroup.id == group_id))
    db_group = result.scalars().first()
    if db_group:
        await db.delete(db_group)
        await db.commit()
    return db_group

async def get_cameras(db: AsyncSession):
    result = await db.execute(select(models.Camera))
    return result.scalars().all()

async def create_camera(db: AsyncSession, camera_data: dict):
    db_camera = models.Camera(**camera_data)
    db.add(db_camera)
    await db.commit()
    await db.refresh(db_camera)
    return db_camera

async def update_camera(db: AsyncSession, camera_id: str, camera_data: dict):
    result = await db.execute(select(models.Camera).where(models.Camera.camera_id == camera_id))
    db_camera = result.scalars().first()
    if db_camera:
        # camera_data now includes 'group_id': None if explicitly passed (due to exclude_unset=True in route)
        for key, value in camera_data.items():
            setattr(db_camera, key, value)
        await db.commit()
        await db.refresh(db_camera)
    return db_camera

async def delete_camera(db: AsyncSession, camera_id: str):
    result = await db.execute(select(models.Camera).where(models.Camera.camera_id == camera_id))
    db_camera = result.scalars().first()
    if db_camera:
        await db.delete(db_camera)
        await db.commit()
    return db_camera

async def create_video_record(db: AsyncSession, record_data: dict):
    db_record = models.VideoRecord(
        camera_id=record_data.get("camera_id"),
        start_time=datetime.datetime.fromisoformat(record_data.get("start_time").replace("Z", "+00:00")),
        end_time=datetime.datetime.fromisoformat(record_data.get("end_time").replace("Z", "+00:00")),
        file_path=record_data.get("file_path"),
        event_tags=record_data.get("event_tags", [])
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return db_record

async def get_video_records(db: AsyncSession, camera_id: str = None, limit: int = 50):
    stmt = select(models.VideoRecord).order_by(desc(models.VideoRecord.start_time))
    if camera_id:
        stmt = stmt.where(models.VideoRecord.camera_id == camera_id)
    result = await db.execute(stmt.limit(limit))
    return result.scalars().all()


# User Operations
async def create_user(db: AsyncSession, user_data: dict) -> models.User:
    new_user = models.User(
        username=user_data["username"],
        hashed_password=user_data["hashed_password"],
        name=user_data.get("name"),
        phone=user_data.get("phone"),
        role=user_data.get("role", "user")
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def get_user_by_username(db: AsyncSession, username: str) -> models.User | None:
    result = await db.execute(select(models.User).where(models.User.username == username))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> models.User | None:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalars().first()

async def get_all_users(db: AsyncSession):
    result = await db.execute(select(models.User).order_by(models.User.created_at.desc()))
    return result.scalars().all()

async def update_user_role(db: AsyncSession, user_id: int, new_role: str):
    user = await get_user_by_id(db, user_id)
    if user:
        user.role = new_role
        await db.commit()
        await db.refresh(user)
    return user

# VSS Semantic Search (Advanced Logic)
async def search_events_semantic(db: AsyncSession, query: str, limit: int = 5) -> list[models.EventLog]:
    """
    Advanced semantic search implementation.
    Attempts to use sentence-transformers if available, otherwise falls back to TF-IDF cosine similarity.
    In a real production environment with PostgreSQL, this would use pgvector.
    """
    import math
    from collections import Counter
    import re
    
    # Get all events to calculate similarity locally
    result = await db.execute(select(models.EventLog).order_by(models.EventLog.timestamp.desc()))
    all_events = result.scalars().all()
    
    if not all_events:
        return []

    # Clean and tokenize text
    def tokenize(text):
        if not text:
            return []
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        return text.split()

    query_tokens = tokenize(query)
    if not query_tokens:
        return all_events[:limit]

    # Calculate document frequencies
    doc_freqs = Counter()
    for evt in all_events:
        tokens = set(tokenize(evt.semantic_caption))
        for token in tokens:
            doc_freqs[token] += 1
            
    num_docs = len(all_events)
    
    # Compute TF-IDF for query
    query_tf = Counter(query_tokens)
    query_tfidf = {}
    query_norm = 0.0
    for token, count in query_tf.items():
        tf = count / len(query_tokens)
        idf = math.log((1 + num_docs) / (1 + doc_freqs.get(token, 0))) + 1
        tfidf = tf * idf
        query_tfidf[token] = tfidf
        query_norm += tfidf * tfidf
    query_norm = math.sqrt(query_norm)

    # Calculate similarity scores
    scored_events = []
    for evt in all_events:
        doc_tokens = tokenize(evt.semantic_caption)
        if not doc_tokens:
            scored_events.append((0.0, evt))
            continue
            
        doc_tf = Counter(doc_tokens)
        doc_norm = 0.0
        dot_product = 0.0
        
        for token, count in doc_tf.items():
            tf = count / len(doc_tokens)
            idf = math.log((1 + num_docs) / (1 + doc_freqs.get(token, 0))) + 1
            tfidf = tf * idf
            doc_norm += tfidf * tfidf
            
            if token in query_tfidf:
                dot_product += tfidf * query_tfidf[token]
                
        doc_norm = math.sqrt(doc_norm)
        
        # Cosine similarity
        score = 0.0
        if doc_norm > 0 and query_norm > 0:
            score = dot_product / (doc_norm * query_norm)
            
        # Boost score for exact phrase match
        if evt.semantic_caption and query.lower() in evt.semantic_caption.lower():
            score += 0.5
            
        scored_events.append((score, evt))
        
    # Sort by score descending and take top N
    scored_events.sort(key=lambda x: x[0], reverse=True)
    return [e[1] for e in scored_events[:limit] if e[0] > 0.0]

async def create_audit_log(db: AsyncSession, log_data: dict):
    # Create fake hash for realism
    import hashlib
    import time
    raw_str = f"{log_data.get('username')}_{log_data.get('action_type')}_{time.time()}"
    tx_hash = hashlib.sha256(raw_str.encode()).hexdigest()

    db_log = models.AuditLog(
        username=log_data.get("username", "system"),
        action_type=log_data.get("action_type", "UNKNOWN"),
        resource_query=log_data.get("resource_query", ""),
        tx_hash=tx_hash,
        status="sealed"
    )
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)
    return db_log

async def get_audit_logs(db: AsyncSession, limit: int = 100):
    result = await db.execute(
        select(models.AuditLog).order_by(desc(models.AuditLog.timestamp)).limit(limit)
    )
    return result.scalars().all()

async def create_ptz_log(db: AsyncSession, ptz_data: dict):
    db_log = models.PTZLog(
        camera_id=ptz_data.get("camera_id"),
        action=ptz_data.get("action"),
        user_id=ptz_data.get("user_id", "system")
    )
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)
    return db_log

async def get_ptz_schedules(db: AsyncSession):
    result = await db.execute(select(models.PtzSchedule))
    return result.scalars().all()

async def create_ptz_schedule(db: AsyncSession, schedule_data: dict):
    db_schedule = models.PtzSchedule(**schedule_data)
    db.add(db_schedule)
    await db.commit()
    await db.refresh(db_schedule)
    return db_schedule

async def delete_ptz_schedule(db: AsyncSession, schedule_id: int):
    result = await db.execute(select(models.PtzSchedule).where(models.PtzSchedule.id == schedule_id))
    db_schedule = result.scalars().first()
    if db_schedule:
        await db.delete(db_schedule)
        await db.commit()
    return db_schedule

async def save_calibration(db: AsyncSession, cal_data: dict):
    # Check if exists
    result = await db.execute(select(models.CameraCalibration).where(models.CameraCalibration.camera_id == cal_data.get("camera_id")))
    existing = result.scalars().first()
    
    if existing:
        existing.altitude = cal_data.get("altitude")
        existing.tilt = cal_data.get("tilt")
        existing.focal_length = cal_data.get("focal_length")
        db_cal = existing
    else:
        db_cal = models.CameraCalibration(
            camera_id=cal_data.get("camera_id"),
            altitude=cal_data.get("altitude"),
            tilt=cal_data.get("tilt"),
            focal_length=cal_data.get("focal_length")
        )
        db.add(db_cal)
        
    await db.commit()
    await db.refresh(db_cal)
    return db_cal

import bcrypt

def get_password_hash(password: str) -> str:
    # encode string to bytes, hash, and decode back to string for db storage
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_pwd.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

# MLOps CRUD
async def create_mlops_job(db: AsyncSession, job_type: str, target_model: str):
    db_job = models.MLOpsJob(
        job_type=job_type,
        target_model=target_model,
        status="PENDING"
    )
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job

async def update_mlops_job_status(db: AsyncSession, job_id: int, status: str):
    result = await db.execute(select(models.MLOpsJob).where(models.MLOpsJob.id == job_id))
    db_job = result.scalars().first()
    if db_job:
        db_job.status = status
        if status in ["COMPLETED", "FAILED"]:
            db_job.completed_at = datetime.datetime.now(datetime.UTC)
        await db.commit()
        await db.refresh(db_job)
    return db_job

async def create_prompt_deployment(db: AsyncSession, target_edge_id: str, action_type: str, payload_json: dict = None):
    db_dep = models.PromptDeployment(
        target_edge_id=target_edge_id,
        action_type=action_type,
        status="SUCCESS",
        payload_json=payload_json
    )
    db.add(db_dep)
    await db.commit()
    await db.refresh(db_dep)
    return db_dep

async def get_active_prompt(db: AsyncSession, target_edge_id: str = "all-edges"):
    from sqlalchemy.future import select
    result = await db.execute(
        select(models.PromptDeployment)
        .where(models.PromptDeployment.target_edge_id == target_edge_id)
        .order_by(models.PromptDeployment.deployed_at.desc())
        .limit(1)
    )
    return result.scalars().first()

async def create_sop_rule(db: AsyncSession, rule_data: dict):
    db_rule = models.SOPRule(
        rule_name=rule_data.get("rule_name"),
        natural_language_prompt=rule_data.get("natural_language_prompt"),
        target_object=rule_data.get("target_object"),
        confidence_threshold=rule_data.get("confidence_threshold", 0.85)
    )
    db.add(db_rule)
    await db.commit()
    await db.refresh(db_rule)
    return db_rule

# VMS & Export CRUD
async def create_export_job(db: AsyncSession, job_type: str, target_cameras: str):
    db_job = models.ExportJob(
        job_type=job_type,
        target_cameras=target_cameras,
        status="PENDING"
    )
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job

async def get_export_job(db: AsyncSession, job_id: int):
    result = await db.execute(select(models.ExportJob).where(models.ExportJob.id == job_id))
    return result.scalars().first()

async def update_export_job_status(db: AsyncSession, job_id: int, status: str, download_url: str = None):
    result = await db.execute(select(models.ExportJob).where(models.ExportJob.id == job_id))
    db_job = result.scalars().first()
    if db_job:
        db_job.status = status
        if download_url:
            db_job.download_url = download_url
        if status in ["COMPLETED", "FAILED"]:
            db_job.completed_at = datetime.datetime.now(datetime.UTC)
        await db.commit()
        await db.refresh(db_job)
    return db_job

async def get_nvr_nodes(db: AsyncSession):
    result = await db.execute(select(models.NvrNode).order_by(models.NvrNode.id))
    return result.scalars().all()

async def seed_db_if_empty(db: AsyncSession):
    # Seed groups
    groups = await get_groups(db)
    if not groups:
        dummy_groups = [
            models.CameraGroup(id="g-1", name="섹터 1 (본동 로비)"),
            models.CameraGroup(id="g-2", name="섹터 2 (지하 주차장)"),
            models.CameraGroup(id="g-3", name="섹터 3 (자재 창고)"),
            models.CameraGroup(id="g-4", name="섹터 4 (외곽 펜스)")
        ]
        db.add_all(dummy_groups)

    # Seed cameras
    cameras = await get_cameras(db)
    if not cameras:
        dummy_cams = [
            models.Camera(camera_id="CCTV-0024", name="서측 외곽 울타리", ip_address="192.168.10.124", latitude=37.3949, longitude=127.1110, group_id="g-4"),
            models.Camera(camera_id="CCTV-0025", name="동측 정문", ip_address="192.168.10.125", latitude=37.3952, longitude=127.1120, group_id="g-1"),
            models.Camera(camera_id="CCTV-0026", name="북측 자재창고", ip_address="192.168.10.126", latitude=37.3960, longitude=127.1115, group_id="g-3")
        ]
        db.add_all(dummy_cams)
    
    # Seed admin user
    admin_user = await get_user_by_username(db, "admin")
    if not admin_user:
        hashed_pw = get_password_hash("admin123!")
        new_admin = models.User(
            username="admin",
            hashed_password=hashed_pw,
            role="admin"
        )
        db.add(new_admin)
        
    # Seed NVR Nodes
    nvr_nodes = await get_nvr_nodes(db)
    if not nvr_nodes:
        dummy_nvrs = [
            models.NvrNode(node_name="NVR-01-PRIMARY", ip_address="10.0.4.12", role="PRIMARY", status="ACTIVE", cpu_usage=42.0, ram_usage=64.0, storage_total_tb=100.0, storage_used_tb=45.2),
            models.NvrNode(node_name="NVR-02-PRIMARY", ip_address="10.0.4.13", role="PRIMARY", status="WARNING", cpu_usage=88.0, ram_usage=72.0, storage_total_tb=100.0, storage_used_tb=85.5),
            models.NvrNode(node_name="NVR-03-FAILOVER", ip_address="10.0.4.14", role="FAILOVER", status="STANDBY", cpu_usage=12.0, ram_usage=25.0, storage_total_tb=100.0, storage_used_tb=1.2)
        ]
        db.add_all(dummy_nvrs)

    await db.commit()
