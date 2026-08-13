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
latest_frame = None

async def mjpeg_handler(request):
    global latest_frame
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
        if latest_frame is not None:
            ret, buffer = cv2.imencode('.jpg', latest_frame)
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

async def run_fast_loop():
    global latest_frame
    print(f"🚀 Starting YOLOv8 Fast-Loop object detection...")
    
    print("Loading YOLOv8 model...")
    model = YOLO("yolov8n.pt")

    video_source = os.getenv("VIDEO_SOURCE", "sample_video.mp4")
    print(f"Opening video source: {video_source}")
    cap = cv2.VideoCapture(video_source)

    if not cap.isOpened():
        print(f"❌ Failed to open video source: {video_source}")
        return

    frame_count = 0
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("End of video stream. Restarting...")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            await asyncio.sleep(0.01)
            
            frame_count += 1
            if frame_count % 3 != 0:
                continue

            results = model(frame, verbose=False)
            
            # Save the plotted frame for MJPEG stream
            latest_frame = results[0].plot()

            detected_objects = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = model.names[cls_id]

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
                
                camera_id = os.getenv("CAMERA_ID", "CCTV-0024-WEST")
                req_payload = {
                    "escalation_id": f"esc_{int(time.time()*1000)}",
                    "camera_id": camera_id,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "trigger_class": trigger_reason,
                    "confidence": detected_objects[0]["detection_confidence"],
                    "crop_box_coordinates": detected_objects[0]["bbox_coordinates_xyxy"][:4],
                    "video_segment_chunk_path": video_source
                }

                if frame_count % 30 == 0:  # Avoid spamming the gateway
                    print(f"🔥 Fast-Loop Detected {len(detected_objects)} objects! Sending REST API Escalation...")
                    try:
                        res = requests.post(API_GATEWAY_URL, json=req_payload, timeout=2)
                        if res.status_code == 202:
                            print(" ✅ Successfully escalated to Slow-Loop VLM!")
                    except Exception as e:
                        print(f" ⚠️ Failed to reach API Gateway: {e}")

    except asyncio.CancelledError:
        print("Stopping Fast-Loop...")
    finally:
        cap.release()

async def main():
    port = int(os.getenv("PORT", 8001))
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
    
    route = app.router.add_get('/video_feed', mjpeg_handler)
    cors.add(route)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', port)
    await site.start()
    print(f"📹 MJPEG Stream started at http://localhost:{port}/video_feed")

    await run_fast_loop()

if __name__ == "__main__":
    asyncio.run(main())
