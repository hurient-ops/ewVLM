import os
import sys
import json
import time
import asyncio
from datetime import datetime
import requests
import tempfile
import numpy as np
from collections import deque
from paligemma_edge_validator import PaligemmaEdgeValidator
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from av import VideoFrame

# Create global instance of Edge Validator
edge_validator = PaligemmaEdgeValidator()

try:
    import cv2
except ImportError:
    print("opencv-python package is missing. Run `pip install opencv-python`")
    sys.exit(1)

try:
    from ultralytics import YOLO
except ImportError:
    print("ultralytics package is missing. Run `pip install ultralytics`")
    sys.exit(1)

try:
    import aiohttp
    from aiohttp import web
except ImportError:
    print("aiohttp package is missing. Run `pip install aiohttp`")
    sys.exit(1)

API_GATEWAY_URL = "http://localhost:8000/api/v1/escalation/trigger"
API_CAMERAS_URL = "http://localhost:8000/api/v1/cameras"
TARGET_FPS = int(os.getenv("TARGET_FPS", "24")) # Set to 24 FPS for smoother real-time GPU processing

CAMERAS = []
latest_frames = {}
frame_buffers = {}
yolo_lock = asyncio.Lock()
vlm_lock = asyncio.Semaphore(1)

async def mjpeg_handler(request):
    camera_id = request.match_info.get('camera_id', 'cam-01')
    camera_id = camera_id.lower()
    
    if camera_id not in latest_frames:
        return web.Response(status=404, text="Camera not found")

    boundary = "frame"
    response = web.StreamResponse(
        status=200,
        reason='OK',
        headers={
            'Content-Type': f'multipart/x-mixed-replace;boundary={boundary}',
            'Access-Control-Allow-Origin': '*'
        }
    )
    await response.prepare(request)
    
    while True:
        frame = latest_frames[camera_id]
        if frame is not None:
            # [Optimization] Drop JPEG quality to 70% for massive bandwidth savings
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
            # Offload synchronous OpenCV imencode to prevent Event Loop blocking
            ret, buffer = await asyncio.to_thread(cv2.imencode, '.jpg', frame, encode_param)
            if ret:
                frame_data = buffer.tobytes()
                try:
                    await response.write(
                        b'--' + boundary.encode() + b'\r\n'
                        b'Content-Type: image/jpeg\r\n'
                        b'Content-Length: ' + str(len(frame_data)).encode() + b'\r\n\r\n' +
                        frame_data + b'\r\n'
                    )
                except BaseException:
                    break
        await asyncio.sleep(0.05)
    return response

class CameraStreamTrack(VideoStreamTrack):
    def __init__(self, camera_id):
        super().__init__()
        self.camera_id = camera_id
        
    async def recv(self):
        pts, time_base = await self.next_timestamp()
        
        # Throttle to TARGET_FPS
        await asyncio.sleep(1.0 / TARGET_FPS)
        
        frame = latest_frames.get(self.camera_id)
        if frame is None:
            # Create a blank black frame if none exists
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            
        # Convert BGR (OpenCV) to RGB (PyAV)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        video_frame = VideoFrame.from_ndarray(frame_rgb, format="rgb24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        return video_frame

async def whep_handler(request):
    camera_id = request.match_info.get('camera_id', 'cam-01').lower()
    
    if camera_id not in latest_frames:
        return web.Response(status=404, text="Camera not found")

    # WHEP requires returning SDP answer based on SDP offer payload
    params = await request.text()
    offer = RTCSessionDescription(sdp=params, type='offer')

    pc = RTCPeerConnection()
    
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print(f"[WebRTC] {camera_id} state is {pc.connectionState}")
        if pc.connectionState == "failed" or pc.connectionState == "closed":
            await pc.close()

    video_track = CameraStreamTrack(camera_id)
    pc.addTrack(video_track)

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type='application/sdp',
        text=pc.localDescription.sdp,
    )

async def camera_loop(camera_id, model, video_source):
    print(f"[{camera_id}] Starting video stream from: {video_source}")
    cap = cv2.VideoCapture(video_source)

    if not cap.isOpened():
        print(f"❌ [{camera_id}] Failed to open video source: {video_source}")
        return

    if camera_id not in frame_buffers:
        frame_buffers[camera_id] = deque(maxlen=60)

    frame_count = 0
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                # Loop video
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            
            frame_buffers[camera_id].append(frame.copy())
            frame_count += 1
            
            # Serialize YOLO inference to prevent CPU overload
            # [NEW] model(frame) -> model.track(frame, persist=True) for ByteTrack Object Tracking
            async with yolo_lock:
                results = await asyncio.to_thread(model.track, frame, persist=True, verbose=False)
            
            # [Optimization] Offload synchronous OpenCV processing to a thread
            # Plotting and resizing 4K frames synchronously will block the asyncio event loop!
            def process_plot(res):
                plotted = res.plot()
                h, w = plotted.shape[:2]
                if h > 720:
                    scale = 720 / h
                    plotted = cv2.resize(plotted, (int(w * scale), 720))
                return plotted
                
            plotted_frame = await asyncio.to_thread(process_plot, results[0])
            latest_frames[camera_id] = plotted_frame

            detected_objects = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = model.names[cls_id]

                    # Trigger on person, car, motorcycle, bus, truck
                    if cls_id in [0, 2, 3, 5, 7] and conf > 0.4:
                        xyxy = [int(v) for v in box.xyxy[0]]
                        
                        # [NEW] Extract ByteTrack ID if tracking is active
                        track_id = int(box.id[0]) if box.id is not None else -1
                        target_uid = f"{camera_id}_{class_name}_{track_id}" if track_id != -1 else f"{camera_id}_{class_name}_{int(time.time()*1000)}"

                        detected_objects.append({
                            "target_uid": target_uid,
                            "track_id": track_id,
                            "class_label": class_name,
                            "detection_confidence": conf,
                            "bbox_coordinates_xyxy": xyxy
                        })

            if detected_objects:
                trigger_reason = "unauthorized_entry" if any(o['class_label'] == 'person' for o in detected_objects) else "vehicle_detected"
                
                # [NEW] Escalate at most once every 10 seconds PER OBJECT ID (Track ID)
                if "tracked_objects_cooldown" not in globals():
                    global tracked_objects_cooldown
                    tracked_objects_cooldown = {}
                
                # Check if any detected object is new or its cooldown has expired
                should_escalate = False
                current_time = time.time()
                for obj in detected_objects:
                    tid = obj["target_uid"]
                    # If it's not tracked (-1), we always escalate but throttle per camera as fallback
                    last_esc_time = tracked_objects_cooldown.get(tid, 0)
                    if current_time - last_esc_time >= 10.0:
                        tracked_objects_cooldown[tid] = current_time
                        should_escalate = True
                
                if should_escalate:
                    
                    # ---------------------------------------------------------
                    # [NEW] Google PaliGemma 2 3B Edge Validator (정탐/오탐 1차 필터링)
                    # ---------------------------------------------------------
                    # [Optimization] Drop VQA escalation if VLM is currently busy to prevent RAM explosion
                    # This prevents hundreds of 4K frames (24MB each) from queueing up in asyncio tasks 
                    # while waiting for the LM Studio 5-second timeout, which causes numpy ArrayMemoryError.
                    if vlm_lock.locked():
                        continue
                        
                    print(f"🔥 [{camera_id}] Detected {len(detected_objects)} objects! Running Edge Validation in background...")
                    
                    # [NEW] Multi-Frame Grid Generation for Temporal Context
                    buf = frame_buffers[camera_id]
                    if len(buf) >= 4:
                        idx = [0, len(buf)//3, 2*len(buf)//3, len(buf)-1]
                        frames = [buf[i] for i in idx]
                    else:
                        frames = [frame.copy()] * 4
                        
                    # 안전한 병합을 위해 640x360으로 일괄 리사이즈
                    resized = [cv2.resize(f, (640, 360)) for f in frames]
                    
                    # 각 프레임의 시간적 순서(시계열)를 VLM이 알 수 있도록 텍스트 오버레이 삽입
                    cv2.putText(resized[0], "T-2.5s", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(resized[1], "T-1.6s", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(resized[2], "T-0.8s", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(resized[3], "T-0.0s (Current)", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    
                    top_row = np.hstack((resized[0], resized[1]))
                    bottom_row = np.hstack((resized[2], resized[3]))
                    grid_image = np.vstack((top_row, bottom_row))
                    
                    temp_path = os.path.join(tempfile.gettempdir(), f"frame_{camera_id}_{int(time.time())}.jpg")
                    cv2.imwrite(temp_path, grid_image)
                    
                    req_payload = {
                        "escalation_id": f"esc_{camera_id}_{int(time.time()*1000)}",
                        "camera_id": camera_id.upper(),
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "trigger_class": trigger_reason,
                        "confidence": detected_objects[0]["detection_confidence"],
                        "crop_box_coordinates": detected_objects[0]["bbox_coordinates_xyxy"][:4],
                        "video_segment_chunk_path": temp_path
                    }
                    
                    async def validate_and_escalate(captured_frame, payload):
                        # [Optimization] Serialize VQA requests to LM Studio to prevent VRAM explosion
                        async with vlm_lock:
                            is_real_threat = await asyncio.to_thread(edge_validator.verify_detection, captured_frame, trigger_reason)
                            
                            if not is_real_threat:
                                print(f" 🛑 [{payload['camera_id']}] Edge Validation rejected the detection (False Positive).")
                                return
                                
                            try:
                                # use aiohttp instead of requests to prevent blocking
                                async with aiohttp.ClientSession() as session:
                                    async with session.post(API_GATEWAY_URL, json=payload, timeout=2) as res:
                                        if res.status == 202:
                                            print(f" ✅ [{payload['camera_id']}] Successfully escalated to Slow-Loop VLM!")
                            except Exception as e:
                                print(f" ⚠️ [{payload['camera_id']}] Failed to reach API Gateway: {e}")
                    
                    # Run it in the background so the video NEVER pauses!
                    asyncio.create_task(validate_and_escalate(frame.copy(), req_payload))

            # Sleep to maintain TARGET_FPS
            await asyncio.sleep(1.0 / TARGET_FPS)

    except asyncio.CancelledError:
        print(f"Stopping camera loop for {camera_id}...")
    finally:
        cap.release()

async def main():
    print(f"🚀 Starting YOLO11 Multi-Channel Fast-Loop (Target FPS: {TARGET_FPS})")
    print("Loading YOLO11 model...")
    
    # We load YOLO once, and share it across all camera loops
    model = YOLO("yolo11n.pt")
    
    # Start Web Server
    port = int(os.getenv("PORT", 8890))
    app = web.Application()
    
    # Setup CORS for development
    import aiohttp_cors
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
    })
    
    # New route supports dynamic camera ID
    route = app.router.add_get('/stream/{camera_id}', mjpeg_handler)
    cors.add(route)

    # WebRTC WHEP route
    route_webrtc = app.router.add_post('/webrtc/{camera_id}/whep', whep_handler)
    cors.add(route_webrtc)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', port)
    await site.start()
    print(f"📹 Multi-Channel MJPEG Stream started at http://localhost:{port}/stream/{{camera_id}}")

    # Fetch dynamic cameras
    import aiohttp
    
    # Try fetching cameras from Gateway
    for _ in range(5):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(API_CAMERAS_URL) as response:
                    if response.status == 200:
                        data = await response.json()
                        global CAMERAS, latest_frames
                        for cam_data in data:
                            if cam_data.get("vlm_enabled"):
                                c_id = cam_data["camera_id"].lower()
                                CAMERAS.append(c_id)
                                latest_frames[c_id] = None
                                if cam_data.get("rtsp_url"):
                                    # Store real rtsp URL in a dictionary or just process it later
                                    # We'll use a dynamic dictionary for sources
                                    if 'CAMERA_SOURCES' not in globals():
                                        global CAMERA_SOURCES
                                        CAMERA_SOURCES = {}
                                    CAMERA_SOURCES[c_id] = cam_data["rtsp_url"]
                        break
        except Exception as e:
            print(f"Waiting for API Gateway... ({e})")
            await asyncio.sleep(2)
            
    if not CAMERAS:
        print("⚠️ No cameras found or API Gateway down. Falling back to default mock.")
        CAMERAS = ["cam-01", "cam-02", "cam-03", "cam-04"]
        latest_frames = {cam: None for cam in CAMERAS}

    # Start Camera Loops
    tasks = []
    
    for cam in CAMERAS:
        mock_path = f"mock_videos/{cam}.mp4"
        
        # Determine video source (priority: Real RTSP -> Mock File -> Sample Video)
        if 'CAMERA_SOURCES' in globals() and cam in CAMERA_SOURCES and CAMERA_SOURCES[cam]:
            video_source = CAMERA_SOURCES[cam]
            print(f"🔗 Using real RTSP stream for {cam}: {video_source}")
        elif os.path.exists(mock_path):
            video_source = mock_path
            print(f"🔗 Using mock video for {cam}: {video_source}")
        else:
            print(f"⚠️ {mock_path} and RTSP not found. Falling back to sample_video.mp4")
            video_source = "sample_video.mp4"
        
        task = asyncio.create_task(camera_loop(cam, model, video_source))
        tasks.append(task)
        
    if tasks:
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
