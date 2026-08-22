import os
import sys
import json
import time
import asyncio
from datetime import datetime
import requests
import tempfile
import numpy as np
from paligemma_edge_validator import PaligemmaEdgeValidator

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
    from aiohttp import web
except ImportError:
    print("aiohttp package is missing. Run `pip install aiohttp`")
    sys.exit(1)

API_GATEWAY_URL = "http://localhost:8000/api/v1/escalation/trigger"
TARGET_FPS = int(os.getenv("TARGET_FPS", "24")) # Set to 24 FPS for smoother real-time GPU processing

CAMERAS = ["cam-01", "cam-02", "cam-03", "cam-04"]
latest_frames = {cam: None for cam in CAMERAS}
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

async def camera_loop(camera_id, model, video_source):
    print(f"[{camera_id}] Starting video stream from: {video_source}")
    cap = cv2.VideoCapture(video_source)

    if not cap.isOpened():
        print(f"❌ [{camera_id}] Failed to open video source: {video_source}")
        return

    frame_count = 0
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                # Loop video
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            
            frame_count += 1
            
            # Serialize YOLO inference to prevent CPU overload
            async with yolo_lock:
                results = await asyncio.to_thread(model, frame, verbose=False)
            
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
                        detected_objects.append({
                            "target_uid": f"{class_name}_{int(time.time()*1000)}",
                            "class_label": class_name,
                            "detection_confidence": conf,
                            "bbox_coordinates_xyxy": xyxy
                        })

            if detected_objects:
                trigger_reason = "unauthorized_entry" if any(o['class_label'] == 'person' for o in detected_objects) else "vehicle_detected"
                
                # Save the exact frame where detection occurred for VLM to analyze
                detected_frame_path = f"mock_videos/detected_{camera_id}.jpg"
                cv2.imwrite(detected_frame_path, frame)
                
                # Escalate at most once every 10 seconds per camera
                if "last_escalation_frame" not in globals():
                    global last_escalation_frame
                    last_escalation_frame = {}
                
                last_frame = last_escalation_frame.get(camera_id, -9999)
                if frame_count - last_frame >= (TARGET_FPS * 10):
                    last_escalation_frame[camera_id] = frame_count
                    
                    # ---------------------------------------------------------
                    # [NEW] Google PaliGemma 2 3B Edge Validator (정탐/오탐 1차 필터링)
                    # ---------------------------------------------------------
                    # [Optimization] Drop VQA escalation if VLM is currently busy to prevent RAM explosion
                    # This prevents hundreds of 4K frames (24MB each) from queueing up in asyncio tasks 
                    # while waiting for the LM Studio 5-second timeout, which causes numpy ArrayMemoryError.
                    if vlm_lock.locked():
                        continue
                        
                    print(f"🔥 [{camera_id}] Detected {len(detected_objects)} objects! Running Edge Validation in background...")
                    
                    temp_path = os.path.join(tempfile.gettempdir(), f"frame_{camera_id}_{int(time.time())}.jpg")
                    cv2.imwrite(temp_path, frame)
                    
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
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', port)
    await site.start()
    print(f"📹 Multi-Channel MJPEG Stream started at http://localhost:{port}/stream/{{camera_id}}")

    # Start Camera Loops
    tasks = []
    # Make sure we use aiohttp in the loop
    global aiohttp
    import aiohttp
    
    for cam in CAMERAS:
        mock_path = f"mock_videos/{cam}.mp4"
        if os.path.exists(mock_path):
            video_source = mock_path
        else:
            print(f"⚠️ {mock_path} not found. Falling back to sample_video.mp4")
            video_source = "sample_video.mp4"
        
        task = asyncio.create_task(camera_loop(cam, model, video_source))
        tasks.append(task)
        
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
