import asyncio
import hashlib
import json
import logging
import httpx
import random
import uuid
import os
import time
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional

import crud
import models
from database import engine, get_db, AsyncSessionLocal
from ewvlm_lmstudio_bridge import LMStudioVLMBridge
from onvif_controller import get_controller
from playback_service import playback_router

vlm_bridge = LMStudioVLMBridge()

# Third-party imports (Ensure graceful degradation if not in environment)
try:
    from fastapi import FastAPI, HTTPException, BackgroundTasks, status, WebSocket, WebSocketDisconnect, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field, HttpUrl
    import uvicorn
except ImportError:
    import sys
    print("Error: FastAPI, uvicorn, and Pydantic are required to run this script.")
    sys.exit(1)

class LoginRequest(BaseModel):
    username: str
    password: str

class AuditLogRequest(BaseModel):
    action_type: str
    resource_query: Optional[str] = None
    username: Optional[str] = "system"

class PTZRequest(BaseModel):
    action: str

class CalibrationRequest(BaseModel):
    altitude: float
    tilt: float
    focal_length: float

class TransformRequest(BaseModel):
    x: int
    y: int
    altitude: float
    tilt: float
    focal_length: float

class HealRequest(BaseModel):
    node_id: str
    action: str

class MLOpsActionRequest(BaseModel):
    action: str
    target: Optional[str] = None
    config: Optional[dict] = None

class SignupRequest(BaseModel):
    username: str
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"

class VSSRequest(BaseModel):
    query: str
    limit: int = 5

class PrivacyExportRequest(BaseModel):
    codec: str = "H.265 (HEVC) - 고효율"
    resolution: str = "1080p (Native)"
    framerate: str = "30 fps"
    watermark: bool = False
    watermark_text: Optional[str] = None
    encrypt: bool = False
    password: Optional[str] = None

class CameraCreate(BaseModel):
    camera_id: str
    name: str
    ip_address: str
    rtsp_url: Optional[str] = None
    group_id: Optional[str] = None
    vlm_enabled: bool = True
    latitude: float = 0.0
    longitude: float = 0.0

class CameraGroupCreate(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    name: str
    ip_address: str
    rtsp_url: Optional[str] = None
    group_id: Optional[str] = None
    vlm_enabled: bool = True
    latitude: float = 0.0
    longitude: float = 0.0

class VideoRecordCreate(BaseModel):
    camera_id: str
    start_time: str
    end_time: str
    file_path: str
    event_tags: Optional[List[str]] = []

# Configure logging to match ewVLM enterprise console styling
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("ewVLMGateway")

# ==============================================================================
# 1. FastAPI Application Setup & Config
# ==============================================================================
app = FastAPI(
    title="ewVLM-Core Intelligent VMS API Gateway",
    version="3.0.0",
    description="NVIDIA DeepStream & K-AI VLM Hybrid Dual-Loop Backend Bridge"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(playback_router)

# In-memory database simulation for prototype self-containment
ACTIVE_PIPELINES: Dict[str, Dict[str, Any]] = {}
DATABASE_MOCK: Dict[str, List[Dict[str, Any]]] = {
    "cameras": [],
    "video_chunks": [],
    "vlm_events": [],
    "vlm_embeddings": [],
    "sop_compliance_logs": [],
    "audit_trails": []
}

# ==============================================================================
# 1.5 WebSocket Connection Manager
# ==============================================================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"WebSocket send error: {e}")

manager = ConnectionManager()

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ==============================================================================
# 2. Pydantic Models (Synchronized with ewvlm-dev-spec-v3 JSON Schemas)
# ==============================================================================
class StreamLinkRequest(BaseModel):
    request_id: str = Field(..., example="req_88492019-32cf")
    operator_id: str = Field(..., example="OP-2041")
    channel_index: int = Field(..., ge=0, le=25, example=4)
    camera_id: str = Field(..., example="CCTV-0024-WEST")
    rtsp_url: str = Field(..., example="rtsp://admin:secured_pass@192.168.10.124:554/profile_t/media.smp")
    decoding_engine: str = Field("NVDEC_HARDWARE_ACCELERATED")
    stream_profile: Dict[str, Any] = Field(
        default={
            "resolution": "1920x1080",
            "fps": 30,
            "codec": "H.265",
            "wisestream_level": "High"
        }
    )

class StreamUnlinkRequest(BaseModel):
    request_id: str = Field(..., example="req_88492020-01ef")
    operator_id: str = Field(..., example="OP-2041")
    channel_index: int = Field(..., example=4)
    camera_id: str = Field(..., example="CCTV-0024-WEST")

class EscalationRequest(BaseModel):
    escalation_id: str = Field(..., example="esc_99201142-8a9d")
    camera_id: str = Field(..., example="CCTV-0024-WEST")
    timestamp: str = Field(..., example="2026-08-10T17:58:04Z")
    trigger_class: str = Field(..., example="person_collapsed")
    confidence: float = Field(..., ge=0.0, le=1.0, example=0.941)
    crop_box_coordinates: List[int] = Field(..., min_items=4, max_items=4, example=[120, 240, 320, 480])
    video_segment_chunk_path: str = Field(..., example="/var/ewvlm/nvr/CCTV-0024-WEST/20260810_175800.mp4")
    operator_id: Optional[str] = Field("OP-ADMIN", example="OP-2041")

# ==============================================================================
# 3. Asynchronous Kafka Manager (Aiokafka)
# ==============================================================================
try:
    from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
except ImportError:
    AIOKafkaProducer = None
    AIOKafkaConsumer = None

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

class KafkaManager:
    def __init__(self):
        self.producer = None
        self.consumer_task = None

    async def connect(self):
        if not AIOKafkaProducer:
            logger.warning("aiokafka not installed. Falling back to Mock mode.")
            return

        try:
            self.producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
            await self.producer.start()
            logger.info(f"📡 [KAFKA] Successfully connected to Kafka Producer at {KAFKA_BOOTSTRAP_SERVERS}")
            
            # Start consumer task for fast loop events
            self.consumer_task = asyncio.create_task(self.consume_fast_loop())
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}. Running in Mock mode.")
            self.producer = None

    async def send_message(self, topic: str, message: Dict[str, Any]):
        payload_str = json.dumps(message, ensure_ascii=False)
        if self.producer:
            await self.producer.send_and_wait(topic, payload_str.encode('utf-8'))
            logger.info(f"📤 [KAFKA] [Topic: {topic}] Message published (Size: {len(payload_str)} bytes)")
        else:
            logger.info(f"📤 [KAFKA MOCK] [Topic: {topic}] Message published (Size: {len(payload_str)} bytes)")
        
        # Real-time console visualization
        if topic == "fast-loop-detections":
            logger.info(f"   └─ [YOLOv11 Alert] Target UID: {message['objects_detected'][0]['target_uid']} | Class: {message['objects_detected'][0]['class_label']}")
        elif topic == "slow-loop-vlm-events":
            logger.info(f"   └─ [VLM Caption] '{message['semantic_caption']}' (Confidence: {message['inference_confidence_score']*100:.1f}%)")
        elif topic == "sop-action-events":
            logger.info(f"   └─ [SOP Action Triaged] Operator {message.get('operator_id')} -> Executed Action Class: {message['sop_id']}")

    async def consume_fast_loop(self):
        consumer = AIOKafkaConsumer(
            "fast-loop-events",
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id="ewvlm-gateway-group",
            auto_offset_reset="latest"
        )
        try:
            await consumer.start()
            logger.info("📡 [KAFKA] Connected Consumer for 'fast-loop-events'")
            async for msg in consumer:
                try:
                    event_data = json.loads(msg.value.decode('utf-8'))
                    logger.info(f"📥 [KAFKA] Received fast-loop-event: {event_data.get('event_id')}")
                    
                    req = EscalationRequest(
                        escalation_id=event_data["event_id"],
                        camera_id=event_data["camera_id"],
                        timestamp=event_data["timestamp"],
                        trigger_class=event_data.get("escalation_trigger_reason", "unknown"),
                        confidence=0.99,
                        crop_box_coordinates=[0,0,0,0],
                        video_segment_chunk_path="/tmp/mock_path.mp4"
                    )
                    asyncio.create_task(simulate_slow_loop_inference(req))
                except Exception as e:
                    logger.error(f"Error processing kafka event: {e}")
        except Exception as e:
            logger.error(f"Kafka Consumer Error: {e}")
        finally:
            await consumer.stop()

kafka_manager = KafkaManager()

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await crud.seed_db_if_empty(db)
    # Populate mock assets
    DATABASE_MOCK["cameras"].append({
        "camera_id": "CCTV-0024-WEST",
        "ip_address": "192.168.10.124",
        "fov_angle_arc": 90.0,
        "is_active": True
    })
    
    # Sync SQLite cameras to MediaMTX
    async with AsyncSessionLocal() as db:
        cameras = await crud.get_cameras(db)
        for cam in cameras:
            if cam.rtsp_url:
                try:
                    async with httpx.AsyncClient() as client:
                        mediamtx_url = f"http://localhost:9997/v3/config/paths/add/{cam.camera_id}"
                        payload = {"source": cam.rtsp_url}
                        await client.post(mediamtx_url, json=payload, timeout=3.0)
                except Exception as e:
                    logger.error(f"Failed to sync {cam.camera_id} to MediaMTX on startup: {e}")

# ==============================================================================
# 4. Background Workers: Simulated DeepStream, VLM, and Blockchain Pipelines
# ==============================================================================
async def simulate_slow_loop_inference(escalation_data: EscalationRequest):
    """
    Simulates Llama 3.2 11B Vision and Upstage Solar DocVLM processing,
    SlowFast Tokenizer compression, and database entries with pgvector.
    """
    logger.info(f"🧠 [VLM_SLOW_LOOP] Initiating Slow-Loop analysis on: {escalation_data.video_segment_chunk_path}")
    logger.info("🧠 [VLM_SLOW_LOOP] Applying SlowFast Token compression: 300 frames -> 45 compressed token embeddings")
    
    # Simulate GPU inference delay (Qwen/Llama inference latency)
    await asyncio.sleep(1.2)
    
    # 1. Grab frame and query Ollama
    video_path = escalation_data.video_segment_chunk_path
    base64_img, _, _ = vlm_bridge.extract_and_encode_frame(video_path, 0)
    prompt = f"The fast-loop YOLO model detected a {escalation_data.trigger_class}. Please provide a 3-sentence detailed Korean summary of the situation shown in the image."
    
    try:
        caption, latency_ms = await asyncio.to_thread(
            vlm_bridge.query_lmstudio_vision, base64_img, "Llama 3.2 11B Vision Instruct", prompt
        )
    except Exception as e:
        logger.error(f"LM Studio inference failed: {e}")
        caption = f"CCTV-0024 구역에서 {escalation_data.trigger_class} 정황 감지됨."
    
    vlm_event_id = f"vlm_evt_{int(time.time()*1000)}"
    # Create Slow-Loop Event Payload
    vlm_event_payload = {
        "event_id": vlm_event_id,
        "reference_escalation_id": escalation_data.escalation_id,
        "camera_id": escalation_data.camera_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "vlm_model_engine": "Llama-3.2-11B-Vision-Instruct (Local)",
        "semantic_caption": caption,
        "inference_confidence_score": round(random.uniform(0.91, 0.98), 4),
        "hallucination_control": {
            "token_min_probability": 0.9481,
            "visual_attention_collapse_prevented": True,
            "evidence_recall_applied": True
        },
        "detected_dangerous_actions": [escalation_data.trigger_class, "safety_violation"],
        "recommended_sop_id": "SOP-REACTION-04" if escalation_data.trigger_class == "person_collapsed" else "SOP-REACTION-01",
        "bounding_box": [
            random.randint(10, 100), random.randint(10, 100), 
            random.randint(150, 300), random.randint(150, 300)
        ],
        "attention_score": round(random.uniform(0.8, 1.0), 3)
    }
    
    # Push Slow-Loop event to Kafka and WebSocket
    await kafka_manager.send_message("slow-loop-vlm-events", vlm_event_payload)
    await manager.broadcast({"type": "vlm_event", "payload": vlm_event_payload})
    
    # 2. Write to mock Database (vlm_events & vlm_embeddings)
    DATABASE_MOCK["vlm_events"].append({
        "event_id": vlm_event_id,
        "camera_id": escalation_data.camera_id,
        "event_time": datetime.utcnow(),
        "event_type": escalation_data.trigger_class,
        "dense_caption": caption,
        "confidence_score": vlm_event_payload["inference_confidence_score"],
        "sop_id": vlm_event_payload["recommended_sop_id"]
    })
    
    # Mocking 768-dimensional visual embeddings for VSS pgvector search
    mock_vector = [round(random.gauss(0, 0.1), 6) for _ in range(768)]
    DATABASE_MOCK["vlm_embeddings"].append({
        "embedding_id": str(uuid.uuid4()),
        "event_id": vlm_event_id,
        "camera_id": escalation_data.camera_id,
        "timestamp": datetime.utcnow(),
        "visual_embedding": mock_vector
    })
    logger.info(f"💾 [DB_WRITE] Saved VLM event and 768-dim visual embedding vector in pgvector table (HNSW index valid)")
    
    # 2.5 Write to Real Database
    async with AsyncSessionLocal() as db:
        await crud.create_event(db, {
            "escalation_id": vlm_event_payload["event_id"],
            "camera_id": escalation_data.camera_id,
            "timestamp": vlm_event_payload["timestamp"],
            "trigger_class": escalation_data.trigger_class,
            "confidence": vlm_event_payload["inference_confidence_score"],
            "semantic_caption": vlm_event_payload["semantic_caption"],
            "crop_box_coordinates": escalation_data.crop_box_coordinates,
            "video_segment_chunk_path": escalation_data.video_segment_chunk_path
        })
    
    # 3. Trigger SOP Compliance Steps and Blockchain Sealing
    await simulate_sop_response(vlm_event_id, vlm_event_payload["recommended_sop_id"], escalation_data.operator_id or "OP-ADMIN")

async def simulate_sop_response(vlm_event_id: str, sop_id: str, operator_id: str):
    """
    Simulates automated SOP execution (Mobile dispatch, IP Audio broadcast)
    and cryptographically seals the audit trail into hyperledger blockchain.
    """
    await asyncio.sleep(0.5)
    action_id = str(uuid.uuid4())
    sop_steps = [
        {
            "step_number": 1,
            "action_type": "PATROL_MOBILE_DISPATCH",
            "target_device_id": "PATROL-CAR-02",
            "execution_payload": {"message": "현장 전도 발생. 원격 모바일 앱 라이브 연동 지시"},
            "executed_timestamp": datetime.utcnow().isoformat() + "Z"
        },
        {
            "step_number": 2,
            "action_type": "IP_AUDIO_TTS_BROADCAST",
            "target_device_id": "SPEAKER-CCTV-0024",
            "execution_payload": {"tts_text": "현장 안전 요원 및 소방차가 출동 중입니다. 움직이지 마십시오."},
            "executed_timestamp": datetime.utcnow().isoformat() + "Z"
        }
    ]
    
    sop_payload = {
        "action_id": action_id,
        "associated_vlm_event_id": vlm_event_id,
        "operator_id": operator_id,
        "sop_id": sop_id,
        "action_steps_executed": sop_steps
    }
    
    await kafka_manager.send_message("sop-action-events", sop_payload)
    await manager.broadcast({"type": "sop_action", "payload": sop_payload})
    
    # Generate cryptographic Audit Sealing (Anti-hacking security)
    raw_log = f"{operator_id}|{action_id}|{datetime.utcnow().isoformat()}"
    log_hash = hashlib.sha256(raw_log.encode()).hexdigest()
    tx_hash = "tx_sealing_" + log_hash[:16]
    
    DATABASE_MOCK["audit_trails"].append({
        "operator_id": operator_id,
        "access_time": datetime.utcnow(),
        "action_type": f"SOP_AUTOMATED_EXECUTION_{sop_id}",
        "blockchain_tx_hash": tx_hash,
        "log_hash": log_hash
    })
    logger.info(f"🔒 [BLOCKCHAIN_SEALING] Sealed SOP execution audit trail on Hyperledger Ledger (Tx: {tx_hash})")

# ==============================================================================
# 5. RESTful API Gateway Endpoints
# ==============================================================================

@app.post("/api/v1/cameras", status_code=status.HTTP_201_CREATED)
async def create_camera(req: CameraCreate, db: AsyncSession = Depends(get_db)):
    camera_data = req.dict()
    db_camera = await crud.create_camera(db, camera_data)
    
    # 2. Add to MediaMTX
    try:
        async with httpx.AsyncClient() as client:
            mediamtx_url = f"http://localhost:9997/v3/config/paths/add/{req.camera_id}"
            payload = {"source": req.rtsp_url or "publisher"}
            response = await client.post(mediamtx_url, json=payload, timeout=5.0)
            if response.status_code != 200:
                logger.warning(f"MediaMTX failed to add path for {req.camera_id}: {response.text}")
            else:
                logger.info(f"MediaMTX successfully registered path for {req.camera_id}")
    except Exception as e:
        logger.error(f"Failed to communicate with MediaMTX: {e}")
        
    return db_camera

@app.get("/api/v1/cameras")
async def get_cameras(db: AsyncSession = Depends(get_db)):
    cameras = await crud.get_cameras(db)
    return cameras

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    rtsp_url: Optional[str] = None
    group_id: Optional[str] = None
    vlm_enabled: Optional[bool] = None

@app.put("/api/v1/cameras/{camera_id}")
async def update_camera(camera_id: str, req: CameraUpdate, db: AsyncSession = Depends(get_db)):
    update_data = req.model_dump(exclude_unset=True)
    db_camera = await crud.update_camera(db, camera_id, update_data)
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    # Sync with MediaMTX if rtsp_url was updated
    if req.rtsp_url is not None:
        try:
            async with httpx.AsyncClient() as client:
                mediamtx_url = f"http://localhost:9997/v3/config/paths/edit/{camera_id}"
                payload = {"source": req.rtsp_url}
                # Using /v3/config/paths/patch/{name}
                res = await client.patch(f"http://localhost:9997/v3/config/paths/patch/{camera_id}", json=payload, timeout=5.0)
                if res.status_code == 404: # if path doesn't exist, try adding it
                    await client.post(f"http://localhost:9997/v3/config/paths/add/{camera_id}", json=payload, timeout=5.0)
        except Exception as e:
            logger.error(f"Failed to update MediaMTX for {camera_id}: {e}")
            
    return db_camera   

@app.delete("/api/v1/cameras/{camera_id}")
async def delete_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    db_camera = await crud.delete_camera(db, camera_id)
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    # Delete from MediaMTX
    try:
        async with httpx.AsyncClient() as client:
            await client.delete(f"http://localhost:9997/v3/config/paths/delete/{camera_id}", timeout=5.0)
    except Exception as e:
        logger.error(f"Failed to delete {camera_id} from MediaMTX: {e}")
        
    return {"status": "SUCCESS"}

# ==========================================
# Camera Groups
# ==========================================

@app.get("/api/v1/groups")
async def get_groups(db: AsyncSession = Depends(get_db)):
    return await crud.get_groups(db)

@app.post("/api/v1/groups", status_code=status.HTTP_201_CREATED)
async def create_group(req: CameraGroupCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_group(db, req.model_dump())

@app.delete("/api/v1/groups/{group_id}")
async def delete_group(group_id: str, db: AsyncSession = Depends(get_db)):
    db_group = await crud.delete_group(db, group_id)
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"status": "SUCCESS"}

# ==========================================
# Video Records & Streams
# ==========================================

@app.get("/api/v1/records")
async def get_records(camera_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    records = await crud.get_video_records(db, camera_id=camera_id)
    return records

from fastapi.responses import FileResponse
import os

@app.get("/api/v1/records/{record_id}/stream")
async def stream_record(record_id: str):
    video_path = os.path.join(os.path.dirname(__file__), "sample_video.mp4")
    if os.path.exists(video_path):
        return FileResponse(video_path, media_type="video/mp4")
    raise HTTPException(status_code=404, detail="Video file not found")

@app.post("/api/v1/streams/link", status_code=status.HTTP_201_CREATED)
async def link_stream(req: StreamLinkRequest):
    """
    API Gateway 1: Live Bind ONVIF camera stream with NVDEC decoding pipeline.
    """
    pipeline_id = f"gstreamer_pipe_{req.camera_id.lower()}_{req.channel_index:02d}"
    
    if req.channel_index in ACTIVE_PIPELINES:
        logger.warning(f"⚠️ [GATEWAY] Channel {req.channel_index} is already active. Overwriting existing linkage.")
        ACTIVE_PIPELINES.pop(req.channel_index)
        
    ACTIVE_PIPELINES[req.channel_index] = {
        "camera_id": req.camera_id,
        "pipeline_id": pipeline_id,
        "linked_at": datetime.utcnow(),
        "rtsp_url": req.rtsp_url
    }
    
    logger.info(f"🔌 [GATEWAY] Bound {req.camera_id} to Channel {req.channel_index} utilizing {req.decoding_engine}")
    
    return {
        "status": "SUCCESS",
        "linked_at": datetime.utcnow().isoformat() + "Z",
        "pipeline_id": pipeline_id,
        "latency_ms": random.randint(8, 15)
    }

@app.post("/api/v1/streams/unlink", status_code=status.HTTP_200_OK)
async def unlink_stream(req: StreamUnlinkRequest):
    """
    API Gateway 2: Safely decouple and deallocate resources from GStreamer context.
    """
    if req.channel_index not in ACTIVE_PIPELINES:
        raise HTTPException(
            status_code=404,
            detail=f"No active stream bound to channel index {req.channel_index}"
        )
        
    pipeline_data = ACTIVE_PIPELINES.pop(req.channel_index)
    logger.info(f"🔌 [GATEWAY] Unlinked {pipeline_data['camera_id']} from Channel {req.channel_index}. Deallocated GStreamer context.")
    
    return {
        "status": "UNLINKED",
        "unlinked_at": datetime.utcnow().isoformat() + "Z",
        "freed_memory_mb": round(random.uniform(96.0, 144.0), 1)
    }

@app.post("/api/v1/escalation/trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_escalation(req: EscalationRequest, background_tasks: BackgroundTasks):
    """
    API Gateway 3: Receive 1-stage YOLO Fast-Loop anomalies, dispatch chunk, trigger VLM Slow-Loop.
    """
    # 1. Publish raw fast-loop metrics to fast-loop-detections kafka topic
    fast_loop_message = {
        "event_id": req.escalation_id,
        "camera_id": req.camera_id,
        "timestamp": req.timestamp,
        "frame_number": random.randint(1200, 1800),
        "objects_detected": [
            {
                "target_uid": random.randint(100, 999),
                "class_label": "person",
                "detection_confidence": req.confidence,
                "bbox_coordinates_xyxy": req.crop_box_coordinates,
                "estimated_speed_kmh": round(random.uniform(0.0, 4.5), 1)
            }
        ],
        "escalation_flag": True,
        "escalation_trigger_reason": req.trigger_class
    }
    
    await kafka_manager.send_message("fast-loop-detections", fast_loop_message)
    
    # 2. Defer slow-loop VLM inference to asynchronous background worker thread pool
    background_tasks.add_task(simulate_slow_loop_inference, req)
    
    return {
        "status": "QUEUED_FOR_VLM_INFERENCE",
        "queue_position": len(BackgroundTasks().tasks) + 1,
        "estimated_inference_latency_sec": 1.25
    }

from fastapi import Depends, Query

@app.get("/api/v1/events", status_code=status.HTTP_200_OK)
async def get_events(limit: int = Query(50, ge=1, le=500), db: AsyncSession = Depends(get_db)):
    """
    API Gateway 4: Fetch historical VLM events from the Database.
    """
    events = await crud.get_recent_events(db, limit=limit)
    return {
        "status": "SUCCESS",
        "events": [
            {
                "id": ev.id,
                "escalation_id": ev.escalation_id,
                "camera_id": ev.camera_id,
                "timestamp": ev.timestamp.isoformat() + "Z" if ev.timestamp else None,
                "trigger_class": ev.trigger_class,
                "confidence": ev.confidence,
                "semantic_caption": ev.semantic_caption,
                "crop_box_coordinates": ev.crop_box_coordinates,
                "video_segment_chunk_path": ev.video_segment_chunk_path
            } for ev in events
        ]
    }


from jose import jwt
class BroadcastRequest(BaseModel):
    zone: str
    message: str
    voice: Optional[str] = "male_command"
    language: Optional[str] = "KO"

@app.post("/api/v1/audio/broadcast", status_code=status.HTTP_200_OK)
async def broadcast_audio(req: BroadcastRequest):
    """
    Simulate TTS generation and broadcasting to an IP speaker zone.
    """
    logger.info(f"📢 [AUDIO_BROADCAST] Zone: {req.zone} | MSG: {req.message}")
    
    # Simulate network & TTS generation delay
    await asyncio.sleep(2.0)
    
    # Broadcast status event via WS
    payload = {
        "zone": req.zone,
        "status": "PLAYING",
        "message": req.message
    }
    await manager.broadcast({"type": "audio_broadcast", "payload": payload})
    
    return {"status": "SUCCESS", "message": "Broadcast completed"}
SECRET_KEY = "ewvlm_super_secret_key_for_demo"
ALGORITHM = "HS256"

# ==========================================
# DevOps & Edge Infra (Phase 7)
# ==========================================

@app.get("/api/v1/infra/topology", status_code=status.HTTP_200_OK)
async def get_infra_topology():
    """Mock SNMP data for network nodes."""
    nodes = {
        "NVR-CORE": {
            "id": "NVR-CORE",
            "type": "nvr",
            "status": "online",
            "uptime": "124d 08h 12m",
            "throughput": "4.2 Gbps",
            "power_draw": "320W",
            "temperature": "45°C"
        },
        "SW-01": {
            "id": "SW-01",
            "type": "switch",
            "status": "online",
            "uptime": "42d 14h 22m",
            "throughput": "1.2 Gbps",
            "power_draw": "150W (PoE)",
            "temperature": "38°C"
        },
        "SW-02": {
            "id": "SW-02",
            "type": "switch",
            "status": "warning",
            "uptime": "42d 14h 20m",
            "throughput": "850 Mbps",
            "power_draw": "180W (PoE)",
            "temperature": "52°C"
        },
        "CAM-1A": {
            "id": "CAM-1A",
            "type": "camera",
            "status": "online",
            "uptime": "12d 01h 05m",
            "throughput": "8 Mbps",
            "power_draw": "12W",
            "temperature": "30°C"
        },
        "CAM-1B": {
            "id": "CAM-1B",
            "type": "camera",
            "status": "warning",
            "uptime": "0d 04h 12m",
            "throughput": "4 Mbps",
            "power_draw": "14W",
            "temperature": "42°C"
        },
        "CAM-2B": {
            "id": "CAM-2B",
            "type": "camera",
            "status": "offline",
            "uptime": "0d 00h 00m",
            "throughput": "0 Mbps",
            "power_draw": "0W",
            "temperature": "N/A"
        }
    }
    return {"status": "SUCCESS", "nodes": nodes}

@app.post("/api/v1/infra/heal")
async def heal_infra_node(request: HealRequest):
    """Simulate a remote self-healing script execution."""
    logger.info(f"Self-healing requested for {request.node_id} with action {request.action}")
    import asyncio
    # Simulate SSH / script execution delay
    await asyncio.sleep(2.5)
    return {
        "status": "SUCCESS", 
        "message": f"Successfully executed {request.action} on {request.node_id}"
    }

# ==========================================
# System Health
# ==========================================

import psutil

@app.get("/api/v1/system/health", status_code=status.HTTP_200_OK)
async def get_system_health():
    cpu = psutil.cpu_percent(interval=None)
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Mocking network traffic for demo
    import random
    net_rx = round(random.uniform(0.5, 2.5), 1)
    
    return {
        "status": "SUCCESS",
        "metrics": [
            {"id": "cpu", "label": "CPU", "value": cpu, "unit": "%"},
            {"id": "ram", "label": "RAM", "value": round(ram.percent), "unit": "%"},
            {"id": "disk", "label": "DISK", "value": round(disk.percent), "unit": "%"},
            {"id": "net", "label": "NET Rx", "value": net_rx, "unit": "Gbps"},
        ]
    }

# ==========================================
# Authentication & Users
# ==========================================

@app.post("/api/v1/auth/login", status_code=status.HTTP_200_OK)
async def login(req: LoginRequest, db = Depends(get_db)):
    user = await crud.get_user_by_username(db, req.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not crud.verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if user.role == "pending":
        raise HTTPException(status_code=403, detail="Account is pending admin approval")
    
    access_token = jwt.encode({"sub": user.username, "role": user.role}, SECRET_KEY, algorithm=ALGORITHM)
    
    # Audit log for login
    await crud.create_audit_log(db, {
        "username": user.username,
        "action_type": "LOGIN",
        "resource_query": "Session Auth"
    })
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"username": user.username, "role": user.role}}

@app.post("/api/v1/auth/signup", status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest, db = Depends(get_db)):
    existing = await crud.get_user_by_username(db, req.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pwd = crud.get_password_hash(req.password)
    user_data = {
        "username": req.username,
        "hashed_password": hashed_pwd,
        "name": req.name,
        "phone": req.phone,
        "role": "pending" # Force pending for new signups
    }
    
    new_user = await crud.create_user(db, user_data)
    
    await crud.create_audit_log(db, {
        "username": req.username,
        "action_type": "USER_CREATED",
        "resource_query": f"New user signup: {req.username}"
    })
    
    return {"message": "User created successfully. Pending admin approval.", "username": new_user.username}

class RoleUpdateRequest(BaseModel):
    role: str

@app.get("/api/v1/users", status_code=status.HTTP_200_OK)
async def get_users(db = Depends(get_db)):
    users = await crud.get_all_users(db)
    return {
        "status": "SUCCESS",
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "role": u.role,
                "created_at": u.created_at.isoformat() + "Z" if u.created_at else None
            } for u in users
        ]
    }

@app.put("/api/v1/users/{user_id}/role", status_code=status.HTTP_200_OK)
async def update_user_role_endpoint(user_id: int, req: RoleUpdateRequest, db = Depends(get_db)):
    user = await crud.update_user_role(db, user_id, req.role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Audit log
    await crud.create_audit_log(db, {
        "username": "admin", # In real app, extract from jwt
        "action_type": "ROLE_UPDATE",
        "resource_query": f"Updated user {user_id} role to {req.role}"
    })
    
    return {"status": "SUCCESS", "message": f"User role updated to {req.role}"}

@app.post("/api/v1/vss/search", status_code=status.HTTP_200_OK)
async def semantic_search(req: VSSRequest, db = Depends(get_db)):
    # Mock VLM extracting intent from natural language query
    keywords = [word for word in req.query.split() if len(word) > 1]
    search_intent = {
        "target_objects": keywords[:2] if keywords else ["사람"],
        "action_context": "쓰러짐" if "쓰러진" in req.query else ("역주행" if "역주행" in req.query else "배회"),
        "temporal_filter": "최근 24시간"
    }
    
    events = await crud.search_events_semantic(db, req.query, req.limit)
    return {
        "status": "success",
        "query": req.query,
        "search_intent": search_intent,
        "results": [
            {
                "id": ev.id,
                "escalation_id": ev.escalation_id,
                "camera_id": ev.camera_id,
                "timestamp": ev.timestamp.isoformat() + "Z" if ev.timestamp else None,
                "trigger_class": ev.trigger_class,
                "confidence": ev.confidence,
                "semantic_caption": ev.semantic_caption,
                "crop_box_coordinates": ev.crop_box_coordinates,
                "video_segment_chunk_path": ev.video_segment_chunk_path
            } for ev in events
        ]
    }

@app.get("/api/v1/events/{id}/report", status_code=status.HTTP_200_OK)
async def get_event_report(id: str, db = Depends(get_db)):
    # In a real scenario, this would call VLM API to generate text based on the event.
    # Here we mock the response.
    return {
        "event_id": id,
        "report_text": f"🚨 [VLM 종합 보고서 - 사건 {id}]\n\n"
                       f"해당 사건은 지능형 영상 관제(VLM)에 의해 자동으로 식별된 정황입니다. "
                       f"화면 내에서 특정 인물/객체의 이상 행동이 {id}번 에스컬레이션 코드와 함께 포착되었습니다. "
                       f"이 인물은 주변을 살피며 조심스럽게 이동하는 패턴을 보였으며, 현재 관련 행동 지침(SOP)에 따라 "
                       f"관제사에게 경고 알림이 전송된 상태입니다. "
                       f"\n\n[권장 조치사항]\n"
                       f"1. 현장 순찰팀 즉시 파견 요망.\n"
                       f"2. 인접 카메라 PTZ 핸드오버를 통한 연속 추적 실시.\n"
                       f"3. 필요 시 IP 오디오 방송을 통해 경고 방송 송출."
    }

@app.post("/api/v1/audit/logs", status_code=status.HTTP_201_CREATED)
async def create_audit_log_endpoint(req: AuditLogRequest, db = Depends(get_db)):
    log = await crud.create_audit_log(db, req.dict())
    return {"status": "SUCCESS", "tx_hash": log.tx_hash}

@app.get("/api/v1/audit/logs", status_code=status.HTTP_200_OK)
async def get_audit_logs_endpoint(limit: int = 100, db = Depends(get_db)):
    logs = await crud.get_audit_logs(db, limit)
    return {
        "status": "SUCCESS",
        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat() + "Z",
                "username": log.username,
                "action_type": log.action_type,
                "resource_query": log.resource_query,
                "tx_hash": log.tx_hash,
                "status": log.status
            } for log in logs
        ]
    }

@app.post("/api/v1/cameras/{camera_id}/ptz")
async def control_ptz(camera_id: str, request: PTZRequest, db: AsyncSession = Depends(get_db)):
    """Mock endpoint to record a PTZ action, now connected to ONVIF."""
    logger.info(f"Received PTZ command for {camera_id}: {request.action}")
    
    # Send ONVIF commands
    controller = await get_controller(camera_id, "192.168.10.124")
    
    action = request.action.lower()
    if action == "stop":
        await controller.stop()
    elif action == "up":
        await controller.continuous_move(0.0, 1.0, 0.0)
    elif action == "down":
        await controller.continuous_move(0.0, -1.0, 0.0)
    elif action == "left":
        await controller.continuous_move(-1.0, 0.0, 0.0)
    elif action == "right":
        await controller.continuous_move(1.0, 0.0, 0.0)
    elif action == "up-left":
        await controller.continuous_move(-1.0, 1.0, 0.0)
    elif action == "up-right":
        await controller.continuous_move(1.0, 1.0, 0.0)
    elif action == "down-left":
        await controller.continuous_move(-1.0, -1.0, 0.0)
    elif action == "down-right":
        await controller.continuous_move(1.0, -1.0, 0.0)
    elif action == "zoom-in":
        await controller.continuous_move(0.0, 0.0, 1.0)
    elif action == "zoom-out":
        await controller.continuous_move(0.0, 0.0, -1.0)

    ptz_data = {
        "camera_id": camera_id,
        "action": request.action,
        "user_id": "api_user"
    }
    await crud.create_ptz_log(db, ptz_data)
    
    # Also log it in the audit log
    tx_hash = hashlib.sha256(f"{camera_id}{request.action}{datetime.utcnow().isoformat()}".encode()).hexdigest()
    await crud.create_audit_log(db, {
        "username": "api_user",
        "action_type": "PTZ_CONTROL",
        "resource_query": f"{camera_id}: {request.action}",
        "tx_hash": tx_hash
    })
    
    return {"status": "SUCCESS", "message": f"PTZ action {request.action} applied to {camera_id}"}

@app.post("/api/v1/cameras/{camera_id}/calibration")
async def save_camera_calibration(camera_id: str, request: CalibrationRequest, db: AsyncSession = Depends(get_db)):
    """Mock endpoint to save camera calibration."""
    logger.info(f"Received Calibration for {camera_id}: {request.dict()}")
    cal_data = {
        "camera_id": camera_id,
        "altitude": request.altitude,
        "tilt": request.tilt,
        "focal_length": request.focal_length
    }
    cal = await crud.save_calibration(db, cal_data)
    
    # Audit log
    tx_hash = hashlib.sha256(f"{camera_id}CALIB{datetime.utcnow().isoformat()}".encode()).hexdigest()
    await crud.create_audit_log(db, {
        "username": "api_user",
        "action_type": "CALIBRATION_UPDATE",
        "resource_query": f"{camera_id}: Alt={request.altitude}, Tilt={request.tilt}",
        "tx_hash": tx_hash
    })
    
    return {"status": "SUCCESS", "message": "Calibration saved", "data": request.dict()}

@app.post("/api/v1/cameras/{camera_id}/transform")
async def transform_coordinates(camera_id: str, request: TransformRequest):
    """Calculate approximate 3D ground distance based on 2D pixel input and calibration parameters."""
    import math
    
    # 간략화된 투영 변환 모델 (Ground Plane Assumption)
    # y 픽셀 값이 이미지의 아래쪽(1080에 가까울수록) 카메라와 더 가깝다고 가정
    img_height = 1080
    img_width = 1920
    
    # 중심점 기준 정규화
    cx = img_width / 2
    cy = img_height / 2
    
    # Normalized coordinates
    nx = (request.x - cx) / cx
    ny = (request.y - cy) / cy
    
    # 틸트 각도 보정 (라디안)
    tilt_rad = math.radians(abs(request.tilt))
    
    # 아주 대략적인 거리 계산 공식 (Mock)
    # y 픽셀이 중심보다 아래에 있을수록 거리가 가까움
    # y = 1080 (ny = 1) -> 거리가 고도와 비슷함
    # y = 540 (ny = 0) -> 무한대에 가까워짐
    if ny <= 0.1: # 지평선 너머이거나 너무 멀리 있음
        distance_m = float('inf')
    else:
        # 간단한 삼각함수 비례식 적용
        distance_m = request.altitude / math.tan(tilt_rad + ny * (request.focal_length / 10))
    
    # 좌우 오프셋 계산 (x 거리)
    offset_x_m = nx * distance_m * (request.focal_length / 10)
    
    return {
        "status": "SUCCESS",
        "distance_m": round(abs(distance_m), 2) if distance_m != float('inf') else -1,
        "offset_x_m": round(offset_x_m, 2),
        "camera_id": camera_id
    }

@app.get("/api/v1/cameras", status_code=status.HTTP_200_OK)
async def get_cameras():
    """API Gateway 5: Fetch active cameras for GIS Map integration."""
    # Mocking some active cameras in the DB for the map
    mock_cameras = [
        {"camera_id": "CAM-01", "name": "외곽 1구역 펜스 북부", "latitude": 37.5665, "longitude": 126.9780, "is_active": True},
        {"camera_id": "CAM-02", "name": "자재 창고 출입구", "latitude": 37.5670, "longitude": 126.9770, "is_active": True},
        {"camera_id": "CAM-03", "name": "중앙 변전실 내부", "latitude": 37.5660, "longitude": 126.9790, "is_active": True},
        {"camera_id": "CAM-04", "name": "본관 메인 로비", "latitude": 37.5655, "longitude": 126.9785, "is_active": True}
    ]
    # Check if DATABASE_MOCK has cameras (it does from startup_event)
    db_cams = DATABASE_MOCK.get("cameras", [])
    if db_cams:
        for dc in db_cams:
            mock_cameras.append({
                "camera_id": dc.get("camera_id"),
                "name": dc.get("camera_id"),
                "latitude": 37.5680,
                "longitude": 126.9795,
                "is_active": dc.get("is_active", True)
            })
    return {"status": "SUCCESS", "cameras": mock_cameras}

class EventFeedbackRequest(BaseModel):
    is_true_positive: bool
    notes: Optional[str] = None

@app.post("/api/v1/events/{escalation_id}/feedback", status_code=status.HTTP_200_OK)
async def submit_event_feedback(escalation_id: str, req: EventFeedbackRequest, db: AsyncSession = Depends(get_db)):
    """API Endpoint to collect Active Learning feedback from operators."""
    # Mocking the DB update
    logger.info(f"📝 [ACTIVE LEARNING] Feedback received for {escalation_id}: {'True Positive' if req.is_true_positive else 'False Positive (오탐)'}")
    
    # Audit log
    tx_hash = hashlib.sha256(f"{escalation_id}FEEDBACK{datetime.utcnow().isoformat()}".encode()).hexdigest()
    await crud.create_audit_log(db, {
        "username": "api_user",
        "action_type": "EVENT_FEEDBACK_SUBMITTED",
        "resource_query": f"{escalation_id} marked as {'TP' if req.is_true_positive else 'FP'}",
        "tx_hash": tx_hash
    })
    
    return {"status": "SUCCESS", "message": "Feedback recorded for VLM Active Learning"}

class NLRuleRequest(BaseModel):
    natural_language_prompt: str

@app.post("/api/v1/sop/rules/generate", status_code=status.HTTP_200_OK)
async def generate_sop_rule(req: NLRuleRequest):
    """API Endpoint to parse natural language into structured VLM detection rule."""
    logger.info(f"🧠 [VLM_COPILOT] Parsing rule: {req.natural_language_prompt}")
    
    # Simulate VLM processing delay
    await asyncio.sleep(1.5)
    
    # Mock generated rule based on basic keyword matching
    trigger_class = "person"
    if "차량" in req.natural_language_prompt or "트럭" in req.natural_language_prompt:
        trigger_class = "vehicle"
        
    generated_rule = {
        "rule_name": f"AI_Rule_{int(time.time())}",
        "target_object": trigger_class,
        "confidence_threshold": 0.85,
        "action_condition": req.natural_language_prompt,
        "schedule": "24/7",
        "estimated_accuracy": random.randint(85, 98)
    }
    
    return {
        "status": "SUCCESS",
        "message": "제로샷 시뮬레이션 및 룰셋 추출 완료",
        "generated_rule": generated_rule
    }


@app.post("/api/v1/video/export/masking", status_code=status.HTTP_200_OK)
async def export_privacy_video(req: PrivacyExportRequest):
    # 모의: 트랜스코딩 렌더링 파이프라인 시뮬레이션
    await asyncio.sleep(2.5)  # Simulate processing delay
    
    file_name = f"export_{uuid.uuid4().hex[:8]}.mp4"
    if req.encrypt:
        file_name = file_name.replace(".mp4", ".zip")
        
    return {
        "status": "SUCCESS",
        "message": "프라이버시 영상 반출이 성공적으로 완료되었습니다.",
        "file_name": file_name,
        "size": "45.2 MB",
        "config_applied": {
            "codec": req.codec,
            "resolution": req.resolution,
            "watermark": req.watermark,
            "encrypted": req.encrypt
        }
    }

@app.get("/api/v1/bi/stats", status_code=status.HTTP_200_OK)
async def get_bi_stats(db = Depends(get_db)):
    # 모의: 실제 데이터가 쌓였다고 가정하고 BI 통계 계산
    logs = await crud.get_audit_logs(db)
    
    # 가짜 수식 대신 좀 더 그럴듯한 데이터 반환
    base_person = 45820
    base_vehicle = 12430
    base_high_risk = 145
    
    # DB 로그 개수 기반으로 약간의 랜덤성 부여
    modifier = len(logs) if logs else 10
    
    return {
        "status": "SUCCESS",
        "data": {
            "personCount": base_person + (modifier * 15),
            "vehicleCount": base_vehicle + (modifier * 4),
            "highRiskCount": base_high_risk + (modifier // 2),
            "heatmap_zones": [
                {"id": 1, "name": "서쪽 운동장", "status": "danger", "density": 0.85},
                {"id": 2, "name": "북쪽 주차장", "status": "warning", "density": 0.60},
                {"id": 3, "name": "동쪽 하역장", "status": "tertiary", "density": 0.20}
            ],
            "trends": [
                {"time": "10:00", "critical": 2, "warning": 5},
                {"time": "12:00", "critical": 1, "warning": 8},
                {"time": "14:00", "critical": 4, "warning": 3},
                {"time": "15:00", "critical": 12, "warning": 15},
                {"time": "16:00", "critical": 3, "warning": 7},
                {"time": "18:00", "critical": 0, "warning": 2}
            ]
        }
    }

# ==========================================
# Phase 8: MLOps & Device Management
# ==========================================

@app.post("/api/v1/mlops/train/lora")
async def start_lora_training(request: MLOpsActionRequest):
    """Simulate starting a LoRA fine-tuning job."""
    import asyncio
    logger.info(f"LoRA Training started for target: {request.target}")
    await asyncio.sleep(2)
    return {
        "status": "SUCCESS",
        "job_id": f"lora-job-{datetime.utcnow().timestamp()}",
        "message": "LoRA fine-tuning job successfully scheduled."
    }

@app.post("/api/v1/mlops/deploy/prompt")
async def deploy_prompt_gateway(request: MLOpsActionRequest):
    """Simulate prompt deployment to edge nodes."""
    import asyncio
    logger.info(f"Deploying prompts to edge nodes: {request.target}")
    await asyncio.sleep(1.5)
    return {
        "status": "SUCCESS",
        "message": f"Prompt successfully deployed to {request.target or 'all edge nodes'}."
    }

@app.post("/api/v1/devices/config/sync")
async def sync_device_config(request: MLOpsActionRequest):
    """Simulate mass configuration clone/sync to devices."""
    import asyncio
    logger.info("Starting mass device configuration synchronization.")
    await asyncio.sleep(2.5)
    return {
        "status": "SUCCESS",
        "message": "Device configuration sync completed across target fleet."
    }

# ==========================================
# Phase 9: Incident & Dispatch (WebSocket)
# ==========================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"WebSocket broadcast error: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We just keep the connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

class DispatchRequest(BaseModel):
    action: str
    target: str
    message: str
    level: str

@app.post("/api/v1/alerts/{alert_id}/dispatch")
async def dispatch_alert(alert_id: str, request: DispatchRequest):
    """Broadcast dispatch order to mobile patrols."""
    payload = {
        "type": "DISPATCH",
        "alert_id": alert_id,
        "action": request.action,
        "target": request.target,
        "message": request.message,
        "level": request.level,
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }
    await manager.broadcast(payload)
    return {"status": "SUCCESS", "message": f"Alert {alert_id} dispatched."}

# ==========================================
# Phase 10: Forensics & Audit
# ==========================================
class ExportRequest(BaseModel):
    cameras: List[str]
    startTime: str
    endTime: str
    includeMetadata: bool

@app.post("/api/v1/records/export")
async def export_forensic_video(req: ExportRequest):
    """Simulate exporting a forensic video segment."""
    import asyncio
    logger.info(f"Starting forensic video export for {req.cameras} from {req.startTime} to {req.endTime}")
    await asyncio.sleep(2.5) # Simulate processing time
    return {
        "status": "SUCCESS",
        "download_url": f"http://localhost:8000/static/exports/EV-{(int(time.time()))}.mp4"
    }

@app.get("/api/v1/audit/logs")
async def get_audit_logs(limit: int = 50):
    """Return mock audit logs."""
    logs = [
        {"id": "AUD-1001", "timestamp": "2023-10-27T14:12:00Z", "user": "admin", "action": "LOGIN", "target": "System", "ip": "192.168.1.10", "status": "SUCCESS"},
        {"id": "AUD-1002", "timestamp": "2023-10-27T14:15:33Z", "user": "admin", "action": "PTZ_MOVE", "target": "CAM-012", "ip": "192.168.1.10", "status": "SUCCESS"},
        {"id": "AUD-1003", "timestamp": "2023-10-27T14:20:11Z", "user": "operator_1", "action": "EXPORT_VIDEO", "target": "CAM-001,CAM-002", "ip": "10.0.5.22", "status": "SUCCESS"},
        {"id": "AUD-1004", "timestamp": "2023-10-27T14:25:05Z", "user": "system", "action": "AUTO_HEAL", "target": "SW-CORE-01", "ip": "localhost", "status": "SUCCESS"},
        {"id": "AUD-1005", "timestamp": "2023-10-27T14:30:00Z", "user": "admin", "action": "DISPATCH_ALERT", "target": "ALT-101", "ip": "192.168.1.10", "status": "SUCCESS"},
        {"id": "AUD-1006", "timestamp": "2023-10-27T14:35:10Z", "user": "unauthorized", "action": "LOGIN_FAILED", "target": "System", "ip": "11.22.33.44", "status": "FAILED"},
        {"id": "AUD-1007", "timestamp": "2023-10-27T14:40:22Z", "user": "admin", "action": "FIRMWARE_UPDATE", "target": "CAM-045", "ip": "192.168.1.10", "status": "PENDING"},
    ]
    return {"status": "SUCCESS", "data": logs[:limit]}

# ==============================================================================
# 6. Main Executable Entry Point
# ==============================================================================
if __name__ == "__main__":
    uvicorn.run("ewvlm_fastapi_gateway:app", host="0.0.0.0", port=8000, reload=True)
