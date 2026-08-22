import os
import time
import base64
import cv2
import requests

class PaligemmaEdgeValidator:
    """
    Google PaliGemma 2 3B를 이용한 Local Edge 1차 물리 검증기.
    YOLO11의 탐지 결과를 백엔드(Llama 3.2 11B)로 올리기 전에
    오탐(False Positive) 여부를 초고속 VQA로 검증합니다.
    """
    def __init__(self, lmstudio_url="http://127.0.0.1:1234", model_name="local-model"):
        self.lmstudio_url = lmstudio_url
        self.model_name = model_name
        self.headers = {"Content-Type": "application/json"}
        print(f"[EDGE_VALIDATOR] PaliGemma 2 3B 엣지 검증기 초기화 완료 (모델: {self.model_name})")

    def verify_detection(self, image_path_or_frame, trigger_class: str) -> bool:
        """
        주어진 프레임과 트리거 사유를 기반으로 PaliGemma 모델에 VQA를 요청하여
        진짜 위협(True Positive)인지 가짜 알람(False Positive)인지 반환합니다.
        """
        try:
            # 1. 이미지 인코딩
            if isinstance(image_path_or_frame, str):
                frame = cv2.imread(image_path_or_frame)
                if frame is None:
                    print(f"[EDGE_WARN] 이미지를 읽을 수 없음: {image_path_or_frame}")
                    return True # 안전 우선 원칙: 에러 시 일단 통과시킴
            else:
                frame = image_path_or_frame

            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            base64_img = base64.b64encode(buffer).decode('utf-8')

            # 2. VQA 프롬프트 구성
            if trigger_class == "unauthorized_entry" or trigger_class == "person_collapsed":
                prompt = "Is there a real person in this image? Answer only 'yes' or 'no'."
            else:
                prompt = f"Is there a {trigger_class} in this image? Answer only 'yes' or 'no'."

            payload = {
                "model": self.model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}}
                        ]
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 5
            }

            url = f"{self.lmstudio_url}/v1/chat/completions"
            start_time = time.time()
            
            try:
                # 엣지 모델은 빠른 응답이 생명이므로 타임아웃을 짧게 가져감
                response = requests.post(url, headers=self.headers, json=payload, timeout=5)
                latency = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    result = response.json()
                    answer = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip().lower()
                    
                    print(f" 🛡️ [PaliGemma Edge] 검증 소요시간: {latency:.1f}ms | 질문: '{prompt}' | 응답: '{answer}'")
                    
                    if "yes" in answer:
                        return True
                    elif "no" in answer:
                        print(" 🛡️ [PaliGemma Edge] 🛑 오탐(False Positive) 감지! 서버 에스컬레이션을 차단합니다.")
                        return False
                    else:
                        # yes/no 판별 불가 시 안전 우선 통과
                        return True
                else:
                    print(f"[EDGE_WARN] LM Studio 응답 에러 ({response.status_code}): {response.text}")
                    return True
                    
            except requests.exceptions.RequestException as e:
                print(f"[EDGE_WARN] LM Studio 타임아웃 또는 연결 실패: {e}")
                return True # LM Studio가 꺼져있을 수 있으므로 기본 YOLO 결과 신뢰

        except Exception as e:
            print(f"[EDGE_ERROR] PaliGemma 검증 중 오류 발생: {e}")
            return True # 시스템 장애 시 페일세이프(Fail-Safe) 적용
