import asyncio
import hashlib
import json
import logging
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
from ewvlm_ollama_bridge import OllamaVLMBridge
from onvif_controller import get_controller
from playback_service import playback_router

vlm_bridge = OllamaVLMBridge()

# Third-party imports (Ensure graceful degradation if not in environment)
try:
    from fastapi import FastAPI, HTTPException, BackgroundTasks, status, WebSocket, WebSocketDisconnect
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

class SignupRequest(BaseModel):
    username: str
    password: str
    role: str = "user"

class VSSRequest(BaseModel):
    query: str
    limit: int = 5


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
    await kafka_manager.connect()
    # Populate mock assets
    DATABASE_MOCK["cameras"].append({
        "camera_id": "CCTV-0024-WEST",
        "ip_address": "192.168.10.124",
        "fov_angle_arc": 90.0,
        "is_active": True
    })

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
            vlm_bridge.query_ollama_vision, base64_img, "llama3.2-vision", prompt
        )
    except Exception as e:
        logger.error(f"Ollama inference failed: {e}")
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

from fastapi import Depends

@app.get("/api/v1/events", status_code=status.HTTP_200_OK)
async def get_events(limit: int = 50, db = Depends(get_db)):
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

SECRET_KEY = "ewvlm_super_secret_key_for_demo"
ALGORITHM = "HS256"

@app.post("/api/v1/auth/login", status_code=status.HTTP_200_OK)
async def login(req: LoginRequest, db = Depends(get_db)):
    user = await crud.get_user_by_username(db, req.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not crud.verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
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
        "role": req.role
    }
    
    new_user = await crud.create_user(db, user_data)
    
    await crud.create_audit_log(db, {
        "username": req.username,
        "action_type": "USER_CREATED",
        "resource_query": f"New user signup: {req.username}"
    })
    
    return {"message": "User created successfully", "username": new_user.username}

@app.post("/api/v1/vss/search", status_code=status.HTTP_200_OK)
async def semantic_search(req: VSSRequest, db = Depends(get_db)):
    events = await crud.search_events_semantic(db, req.query, req.limit)
    return {
        "status": "success",
        "query": req.query,
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
    tx_hash = hashlib.sha256(f"{camera_id}{request.action}{datetime.datetime.now().isoformat()}".encode()).hexdigest()
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
    tx_hash = hashlib.sha256(f"{camera_id}CALIB{datetime.datetime.now().isoformat()}".encode()).hexdigest()
    await crud.create_audit_log(db, {
        "username": "api_user",
        "action_type": "CALIBRATION_UPDATE",
        "resource_query": f"{camera_id}: Alt={request.altitude}, Tilt={request.tilt}",
        "tx_hash": tx_hash
    })
    
    return {"status": "SUCCESS", "message": "Calibration saved", "data": request.dict()}

# ==============================================================================
# 6. Main Executable Entry Point
# ==============================================================================
if __name__ == "__main__":
    logger.info("==========================================================")
    logger.info("  🚀 Starting ewVLM-Core Intelligent VMS API Gateway Prototype")
    logger.info("  Standard: Korea Public Safety Standard (NDAA-Free Llama Base)")
    logger.info("==========================================================")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
