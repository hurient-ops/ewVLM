import os
import sys
import json
import time
import asyncio
from datetime import datetime
import requests

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
TARGET_FPS = int(os.getenv("TARGET_FPS", "5")) # Set to 5 FPS to save CPU

CAMERAS = ["cam-01", "cam-02", "cam-03", "cam-04"]
latest_frames = {cam: None for cam in CAMERAS}
yolo_lock = asyncio.Lock()

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
            ret, buffer = cv2.imencode('.jpg', frame)
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
            
            # Save the plotted frame for MJPEG stream
            latest_frames[camera_id] = results[0].plot()

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
                
                req_payload = {
                    "escalation_id": f"esc_{camera_id}_{int(time.time()*1000)}",
                    "camera_id": camera_id.upper(), # E.g., CAM-01
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "trigger_class": trigger_reason,
                    "confidence": detected_objects[0]["detection_confidence"],
                    "crop_box_coordinates": detected_objects[0]["bbox_coordinates_xyxy"][:4],
                    "video_segment_chunk_path": detected_frame_path
                }

                if frame_count % (TARGET_FPS * 10) == 0:  # Escalate roughly every 10 seconds per camera
                    print(f"🔥 [{camera_id}] Detected {len(detected_objects)} objects! Sending REST API Escalation...")
                    try:
                        # use aiohttp instead of requests to prevent blocking
                        async with aiohttp.ClientSession() as session:
                            async with session.post(API_GATEWAY_URL, json=req_payload, timeout=2) as res:
                                if res.status == 202:
                                    print(f" ✅ [{camera_id}] Successfully escalated to Slow-Loop VLM!")
                    except Exception as e:
                        print(f" ⚠️ [{camera_id}] Failed to reach API Gateway: {e}")

            # Sleep to maintain TARGET_FPS
            await asyncio.sleep(1.0 / TARGET_FPS)

    except asyncio.CancelledError:
        print(f"Stopping camera loop for {camera_id}...")
    finally:
        cap.release()

async def main():
    print(f"🚀 Starting YOLOv8 Multi-Channel Fast-Loop (Target FPS: {TARGET_FPS})")
    print("Loading YOLOv8 model...")
    
    # We load YOLO once, and share it across all camera loops
    model = YOLO("yolov8n.pt")
    
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
