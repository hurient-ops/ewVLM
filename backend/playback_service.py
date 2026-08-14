import os
import re
from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import StreamingResponse

playback_router = APIRouter()

VIDEO_PATH = "sample_video.mp4"

def send_bytes_range_requests(
    file_path: str, start: int, end: int, chunk_size: int = 1024 * 1024
):
    """Generator to read a chunk of a file."""
    with open(file_path, "rb") as f:
        f.seek(start)
        while (pos := f.tell()) <= end:
            read_size = min(chunk_size, end + 1 - pos)
            yield f.read(read_size)

@playback_router.get("/api/v1/nvr/playback/{camera_id}")
async def get_nvr_playback(camera_id: str, request: Request, timestamp: str = None):
    """
    Simulates fetching video from an NVR.
    Since we only have sample_video.mp4, we will serve it and allow Seeking via Range headers.
    """
    if not os.path.exists(VIDEO_PATH):
        raise HTTPException(status_code=404, detail="Video file not found")

    file_size = os.path.getsize(VIDEO_PATH)
    range_header = request.headers.get("Range")

    if range_header:
        # e.g., "bytes=12345-"
        match = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if not match:
            raise HTTPException(status_code=400, detail="Invalid Range header")
            
        start = int(match.group(1))
        end = match.group(2)
        end = int(end) if end else file_size - 1
        
        if start >= file_size or end >= file_size:
            raise HTTPException(
                status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
                detail="Range out of bounds"
            )
            
        chunk_length = end - start + 1
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_length),
            "Content-Type": "video/mp4",
        }
        
        return StreamingResponse(
            send_bytes_range_requests(VIDEO_PATH, start, end),
            headers=headers,
            status_code=status.HTTP_206_PARTIAL_CONTENT
        )
    else:
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": "video/mp4",
        }
        def iterfile():
            with open(VIDEO_PATH, "rb") as f:
                yield from f
        return StreamingResponse(iterfile(), headers=headers)
