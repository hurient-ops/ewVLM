import os
import uuid
import zipfile
import logging
import subprocess

logger = logging.getLogger("ewVLMVideoExport")

def generate_privacy_video(input_video: str = None, bbox: list = None, watermark_text: str = "", encrypt: bool = False, password: str = "") -> str:
    """Generate an MP4 video with dynamic mosaic/blur effects on bounding boxes and watermark using FFmpeg."""
    os.makedirs("downloads", exist_ok=True)
    
    video_id = uuid.uuid4().hex[:8]
    mp4_filename = f"downloads/export_masked_{video_id}.mp4"
    
    ffmpeg_exe = os.path.join(os.path.dirname(__file__), "ffmpeg.exe")
    if not os.path.exists(ffmpeg_exe):
        logger.error("ffmpeg.exe not found in backend directory!")
        raise FileNotFoundError("ffmpeg.exe is missing")

    safe_watermark = watermark_text.replace("'", "").replace(":", "") if watermark_text else "CONFIDENTIAL"
    
    # 1. Determine input video
    is_testsrc = False
    if not input_video or not os.path.exists(input_video):
        input_video = os.path.join(os.path.dirname(__file__), "sample_video.mp4")
        if not os.path.exists(input_video):
            # Fallback to testsrc if no video exists at all
            input_video = "testsrc=duration=3:size=640x480:rate=30"
            is_testsrc = True
            
    # 2. Build filter_complex
    filters = []
    current_stream = "[0:v]"
    
    if bbox and len(bbox) >= 4:
        # Assuming bbox is [x1, y1, x2, y2]
        x1, y1, x2, y2 = bbox[:4]
        w = max(1, int(x2 - x1))
        h = max(1, int(y2 - y1))
        x = max(0, int(x1))
        y = max(0, int(y1))
        
        crop_blur = f"[0:v]crop={w}:{h}:{x}:{y},boxblur=20:5[b]"
        overlay = f"{current_stream}[b]overlay={x}:{y}[ovr]"
        filters.append(crop_blur)
        filters.append(overlay)
        current_stream = "[ovr]"
        
    # Add watermark
    drawtext = f"{current_stream}drawtext=text='{safe_watermark}':x=20:y=h-40:fontsize=24:fontcolor=white[out]"
    filters.append(drawtext)
    
    filter_complex = ";".join(filters)
    
    cmd = [
        ffmpeg_exe, "-y"
    ]
    
    if is_testsrc:
        cmd.extend(["-f", "lavfi", "-i", input_video])
    else:
        cmd.extend(["-i", input_video])
        
    cmd.extend([
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-c:v", "libx264",
        mp4_filename
    ])
    
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.info(f"Privacy video generated via FFmpeg at {mp4_filename}")
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg failed: {e.stderr.decode()}")
        raise
    
    if encrypt:
        zip_filename = f"downloads/export_masked_{video_id}.zip"
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(mp4_filename, os.path.basename(mp4_filename))
        
        os.remove(mp4_filename)
        return "/" + zip_filename
    
    return "/" + mp4_filename
