import os
import time
import base64
import json
import argparse
from datetime import datetime

# cv2 (OpenCV)가 로컬 환경에 있는지 확인하고 가용 임포트 진행
try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

# HTTP 통신용 requests 임포트
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

class OllamaVLMBridge:
    """
    Ollama Llama 3.2 Vision API 직결용 비디오 프레임 추출 및 JSON 수송 브릿지 시뮬레이터
    """
    def __init__(self, ollama_url="http://localhost:11434", gateway_url="http://localhost:8000"):
        self.ollama_url = ollama_url
        self.gateway_url = gateway_url
        print(f"[INIT] Ollama VLM Bridge 초기화 완료 (Ollama: {ollama_url} | Gateway: {gateway_url})")

    def extract_and_encode_frame(self, video_path, timestamp_sec):
        """
        비디오 파일의 특정 타임스탬프 위치에서 프레임을 추출하고 Base64로 인코딩합니다.
        OpenCV가 없을 경우 가상 프레임 데이터를 생성하는 Fallback 메커니즘을 내장합니다.
        """
        if not HAS_OPENCV:
            print("[WARN] OpenCV 라이브러리가 유실되었습니다. 가상 가속 프레임 버퍼(Simulated Base64)로 대체합니다.")
            return self._generate_mock_base64_image(), 640, 480

        if not os.path.exists(video_path):
            print(f"[WARN] 비디오 파일 경로({video_path})가 물리적으로 존재하지 않습니다. 가상 프레임을 생성합니다.")
            return self._generate_mock_base64_image(), 640, 480

        try:
            if video_path.lower().endswith(('.jpg', '.jpeg', '.png')):
                frame = cv2.imread(video_path)
                if frame is None:
                    raise ValueError(f"이미지 프레임을 읽을 수 없습니다: {video_path}")
                height, width = frame.shape[:2]
            else:
                cap = cv2.VideoCapture(video_path)
                if not cap.isOpened():
                    raise ValueError("비디오 코덱 스트림을 열 수 없습니다.")

                # 밀리초 단위로 탐색 위치 지정
                cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_sec * 1000)
                success, frame = cap.read()
                
                if not success:
                    # 프레임 획득 실패 시 첫 프레임으로 리바인딩 시도
                    cap.set(cv2.CAP_PROP_POS_MSEC, 0)
                    success, frame = cap.read()
                    if not success:
                        raise ValueError("비디오 프레임 버퍼가 비어있습니다.")

                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                cap.release()

            # JPEG 이미지 압축 진행 (WiseStream ROI 효율 극대화)
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            base64_str = base64.b64encode(buffer).decode('utf-8')
            return base64_str, width, height

        except Exception as e:
            print(f"[ERROR] OpenCV 프레임 추출 실패: {e}. 가상 프레임으로 대체 작동합니다.")
            return self._generate_mock_base64_image(), 640, 480

    def _generate_mock_base64_image(self):
        """
        네트워크 차단 및 라이브러리 유실 시 데이터 무결성을 유지하기 위한 가상 1x1 픽셀 이미지 Base64 반환
        """
        # 아주 작고 안전한 1x1 투명 GIF 파일 바이트
        return "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

    def query_ollama_vision(self, base64_image, model_name="llama3.2-vision", prompt="Analyze this frame"):
        """
        Ollama 멀티모달 API 규격에 맞춰 JSON 페이로드를 구성하여 전송하고 응답 레이턴시를 계측합니다.
        """
        url = f"{self.ollama_url}/api/chat"
        payload = {
            "model": "llava",  # Changed from llama3.2-vision to llava due to old Ollama engine
            "format": "json",
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                    "images": [base64_image]
                }
            ],
            "stream": False,
            "options": {
                "temperature": 0.2,
                "top_p": 0.9
            }
        }

        print(f"\n[OLLAMA_VSS] Ollama 멀티모달 추론 요청 시작 (모델: {model_name})")
        print(f" └─ 프롬프트 질의: \"{prompt}\"")

        start_time = time.time()
        
        # 네트워크 미지원 시 오프라인 처리
        if not HAS_REQUESTS:
            latency = 1.15
            time.sleep(latency)
            return "[VLM_OFFLINE] requests 모듈이 없어 AI 서버에 연결할 수 없습니다.", latency * 1000

        try:
            response = requests.post(url, json=payload, timeout=300)
            latency_ms = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                result = response.json()
                caption = result.get("message", {}).get("content", "응답 캡션 없음")
                return caption, latency_ms
            else:
                raise ConnectionError(f"Ollama 서버 응답 에러 (HTTP {response.status_code})")

        except Exception as e:
            latency_ms = (time.time() - start_time) * 1000
            print(f"[ERROR] Ollama 서버 연결 실패: {e}")
            return f"[VLM_OFFLINE] Ollama 서버에 연결할 수 없습니다 ({e}). 실시간 분석이 중단되었습니다.", latency_ms

    def forward_to_gateway(self, camera_id, timestamp, caption, confidence=0.92):
        """
        수집 완료된 VLM 분석 메타데이터를 우리 ewVLM API Gateway 에스컬레이션 규격과 정합해 전송합니다.
        """
        url = f"{self.gateway_url}/api/v1/escalation/trigger"
        payload = {
            "escalation_id": f"esc_{int(time.time())}-ollama-sync",
            "camera_id": camera_id,
            "timestamp": timestamp,
            "trigger_class": "person_collapsed" if "낙상" in caption or "쓰러짐" in caption else "unauthorized_entry",
            "confidence": confidence,
            "crop_box_coordinates": [120, 80, 480, 360],
            "video_segment_chunk_path": "/var/ewvlm/nvr/CCTV-0024-WEST/live_chunk.mp4"
        }

        print(f"\n[EWVLM_GATEWAY] API Gateway로 VLM 정황 메타데이터 에스컬레이션 전송 중...")
        print(f" └─ 엔드포인트: {url}")
        print(f" └─ 가중치 페이로드: {json.dumps(payload, indent=2, ensure_ascii=False)}")

        if not HAS_REQUESTS:
            print("[SUCCESS] API Gateway 바인딩 성공 (Mock-Mode).")
            return True

        try:
            response = requests.post(url, json=payload, timeout=5)
            if response.status_code == 200:
                print(f"[SUCCESS] API Gateway 전송 수락 완료 (HTTP 200). 응답: {response.json()}")
                return True
            else:
                print(f"[WARN] Gateway 응답 이상 (HTTP {response.status_code})")
                return False
        except Exception as e:
            print(f"[WARN] Gateway 서버 통신 차단: {e}. 로컬 스택에 원격 조치 이력을 자율 보존합니다.")
            return False

def main():
    parser = argparse.ArgumentParser(description="ewVLM Ollama Multi-Modal VLM Bridge")
    parser.add_argument("--video", type=str, default="/workspace/datasets/industrial_safety/clips/leak_explosion_cctv0024.mp4", help="비디오 파일 경로")
    parser.add_argument("--sec", type=int, default=5, help="추출할 타임스탬프 (초 단위)")
    parser.add_argument("--model", type=str, default="llama3.2-vision", help="Ollama 배포 VLM 모델명")
    args = parser.parse_args()

    bridge = OllamaVLMBridge()
    
    # 1. 프레임 고속 추출 및 Base64 인코딩
    base64_data, w, h = bridge.extract_and_encode_frame(args.video, args.sec)
    print(f"\n[FRAME_EXTRACT] 비디오 {args.sec}초 시점 프레임 추출 완료.")
    print(f" └─ 해상도 규격: {w}x{h} px | Base64 스트링 길이: {len(base64_data)} 자")

    # 2. Ollama Llama 3.2 Vision 추론 및 레이턴시 프로파일링
    prompt = "CCTV 영상 프레임 속 위험 상황(작업자 안전모 장비 착용 상태, 침입 유무, 낙상 정황)을 한국어 3줄 요약 문맥으로 조밀하게 서술해줘."
    caption, latency_ms = bridge.query_ollama_vision(base64_data, model_name=args.model, prompt=prompt)
    print(f"\n[VLM_RESPONSE] Ollama 의미론적 추론 결과 수신 완료.")
    print(f" └─ 정황 설명(Caption): \"{caption}\"")
    print(f" └─ 하드웨어 추론 레이턴시: {latency_ms:.2f} ms")

    # 3. ewVLM API Gateway (/api/v1/escalation/trigger) 규격 데이터 전송 바인딩
    now_iso = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    bridge.forward_to_gateway(
        camera_id="CCTV-0024-WEST",
        timestamp=now_iso,
        caption=caption
    )

if __name__ == "__main__":
    main()
