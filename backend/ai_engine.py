import httpx
import base64
import cv2
import asyncio
import logging

logger = logging.getLogger(__name__)

LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"

async def analyze_frame_with_vlm(base64_image: str, prompt: str) -> str:
    """
    Sends a base64 encoded image and a prompt to the local LM Studio instance for analysis.
    """
    payload = {
        "model": "local-model", # Usually LM Studio ignores the model name for the default loaded model
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful AI security camera analyst. Answer concisely based on the image."
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.2,
        "max_tokens": 150
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(LM_STUDIO_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"Error calling LM Studio: {e}")
        return "ERROR: Could not reach LM Studio or analysis failed."

def capture_frame_from_rtsp_sync(rtsp_url: str) -> str | None:
    """
    Synchronously captures a single frame from an RTSP stream using OpenCV and returns it as a Base64 string.
    """
    try:
        # Optimization: use cv2.CAP_FFMPEG for RTSP
        cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
        # Timeout handling for OpenCV can be tricky, but we'll try to read one frame
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret or frame is None:
            logger.warning(f"Failed to capture frame from {rtsp_url}")
            return None
            
        # Encode to JPEG to reduce size
        # Optional: Resize frame if it's too large to save inference time
        frame = cv2.resize(frame, (640, 480))
        success, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        
        if not success:
            logger.warning("Failed to encode frame to JPEG")
            return None
            
        return base64.b64encode(buffer).decode('utf-8')
    except Exception as e:
        logger.error(f"Error capturing frame from {rtsp_url}: {e}")
        return None

async def capture_frame_from_rtsp(rtsp_url: str) -> str | None:
    """
    Asynchronously capture frame to prevent blocking the FastAPI event loop.
    """
    return await asyncio.to_thread(capture_frame_from_rtsp_sync, rtsp_url)
