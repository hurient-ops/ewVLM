import time
import os
import subprocess

try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    print("Error: imageio-ffmpeg is not installed. Run 'pip install imageio-ffmpeg'")
    exit(1)

# RTSP Stream URLs
STREAMS = [
    {'url': 'rtsp://admin:Sptdhkdlwjch100%40@192.168.0.71:554/profile1', 'output': 'record_71.mp4'},
    {'url': 'rtsp://admin:Sptdhkdlwjch100%40@192.168.0.72:554/profile1', 'output': 'record_72.mp4'}
]
RECORD_DURATION = 15 # seconds

def capture_stream():
    processes = []
    
    print(f"Real-time transcoding to H.264 via FFmpeg ({FFMPEG_EXE})")
    
    for stream in STREAMS:
        url = stream['url']
        out_file = stream['output']
        print(f"Connecting to RTSP stream: {url}")
        
        if os.path.exists(out_file):
            os.remove(out_file)
            
        ffmpeg_cmd = [
            FFMPEG_EXE,
            "-y",
            "-rtsp_transport", "tcp",
            "-i", url,
            "-t", str(RECORD_DURATION),
            "-c:v", "copy",
            "-movflags", "+faststart",
            out_file
        ]
        
        p = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processes.append({'process': p, 'file': out_file})
        
    print(f"Recording started for {len(STREAMS)} cameras. Will record for {RECORD_DURATION} seconds...")
    
    for p_info in processes:
        p = p_info['process']
        out_file = p_info['file']
        stdout, stderr = p.communicate()
        if p.returncode == 0:
            print(f"Recording finished successfully. Saved to {out_file}.")
        else:
            print(f"Recording failed for {out_file}. FFmpeg output:")
            print(stderr.decode('utf-8', errors='ignore'))
        
if __name__ == "__main__":
    capture_stream()
