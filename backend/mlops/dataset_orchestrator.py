import os
import json
import logging
import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
import models

logger = logging.getLogger("DatasetOrchestrator")

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "finetune"))
IMAGES_DIR = os.path.join(DATASET_DIR, "images")

class DatasetOrchestrator:
    """
    관제사의 피드백 데이터를 LLaMA-Factory Vision 표준 멀티모달 데이터셋으로 변환하는 오케스트레이터
    """
    def __init__(self, output_dir: str = DATASET_DIR):
        self.output_dir = output_dir
        self.images_dir = os.path.join(output_dir, "images")
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.images_dir, exist_ok=True)

    async def build_llama_factory_dataset(self, db: AsyncSession) -> dict:
        """
        feedback_logs 테이블에서 피드백 데이터를 조회하여 LLaMA-Factory 호환 포맷으로 덤프
        """
        # 1. 피드백 로그 조회
        result = await db.execute(select(models.FeedbackLog).order_by(models.FeedbackLog.id))
        feedbacks = result.scalars().all()

        samples = []
        exported_ids = []

        # 더미 샘플 생성기 (초기 데이터가 적을 때 기본 검증용 시나리오 제공)
        if not feedbacks:
            logger.info("ℹ️ No feedback logs in DB. Generating standard CCTV safety scenarios...")
            synthetic_samples = [
                {
                    "messages": [
                        {"role": "user", "content": "<image> CCTV 영상에서 비정상 행위 또는 위험 요소를 감지하고 한국어로 보고하세요."},
                        {"role": "assistant", "content": "위험 등급: CRITICAL. 산업 설비 구역 내 쓰러짐(Fall-down) 상태의 작업자가 감지되었습니다. 즉시 안전 관리자 출동이 필요합니다."}
                    ],
                    "images": ["images/sample_falldown.jpg"]
                },
                {
                    "messages": [
                        {"role": "user", "content": "<image> CCTV 영상에서 비정상 행위 또는 위험 요소를 감지하고 한국어로 보고하세요."},
                        {"role": "assistant", "content": "위험 등급: WARNING. 서측 외곽 울타리 구역에서 비인가 침입자(Intrusion)의 월담 행위가 포착되었습니다. 경고 방송 송출 권장."}
                    ],
                    "images": ["images/sample_intrusion.jpg"]
                },
                {
                    "messages": [
                        {"role": "user", "content": "<image> CCTV 영상에서 비정상 행위 또는 위험 요소를 감지하고 한국어로 보고하세요."},
                        {"role": "assistant", "content": "위험 등급: SAFE. 자재 창고 구역 작업자 안전모 정상 착용 및 규정 속도 이동 중. 특이사항 없음."}
                    ],
                    "images": ["images/sample_normal.jpg"]
                }
            ]
            samples.extend(synthetic_samples)
        else:
            for fb in feedbacks:
                target_response = ""
                if fb.feedback_type == "true_positive":
                    target_response = f"위험 등급: CONFIRMED. 현장 상황: {fb.original_caption}. 관제사 확인 완료된 실제 위험 상황입니다."
                elif fb.feedback_type == "false_positive":
                    target_response = f"위험 등급: SAFE. 현장 상황: 오탐(False Alarm)으로 판정됨. 일반적인 환경 요인(그림자/바람/조명)이며 특이사항 없습니다."
                elif fb.feedback_type == "corrected_label":
                    target_response = f"위험 등급: CORRECTED. 보정된 판정: {fb.corrected_caption or fb.corrected_class}. 정확한 라벨로 수정 조치됨."

                # 이미지 경로 결정
                rel_img_path = "images/cctv_default.jpg"
                if fb.image_path and os.path.exists(fb.image_path):
                    rel_img_path = os.path.relpath(fb.image_path, self.output_dir)

                samples.append({
                    "messages": [
                        {
                            "role": "user",
                            "content": f"<image> 카메라 [{fb.camera_id or 'CCTV-MAIN'}]의 현장 영상을 분석하고 관제 위험도를 판단하세요."
                        },
                        {
                            "role": "assistant",
                            "content": target_response
                        }
                    ],
                    "images": [rel_img_path]
                })
                exported_ids.append(fb.id)

        # 2. ewvlm_vision_data.json 파일 저장
        data_json_path = os.path.join(self.output_dir, "ewvlm_vision_data.json")
        with open(data_json_path, "w", encoding="utf-8") as f:
            json.dump(samples, f, ensure_ascii=False, indent=2)

        # 3. LLaMA-Factory의 dataset_info.json 레지스트리 작성
        dataset_info = {
            "ewvlm_cctv_vision": {
                "file_name": "ewvlm_vision_data.json",
                "formatting": "sharegpt",
                "columns": {
                    "messages": "messages",
                    "images": "images"
                }
            }
        }
        dataset_info_path = os.path.join(self.output_dir, "dataset_info.json")
        with open(dataset_info_path, "w", encoding="utf-8") as f:
            json.dump(dataset_info, f, ensure_ascii=False, indent=2)

        # 4. DB 피드백 상태 업데이트
        if exported_ids:
            for fb in feedbacks:
                if fb.id in exported_ids:
                    fb.is_exported_to_dataset = 1
            await db.commit()

        logger.info(f"✅ [DATASET] LLaMA-Factory Vision dataset generated with {len(samples)} samples at {self.output_dir}")

        return {
            "status": "SUCCESS",
            "total_samples": len(samples),
            "output_dir": self.output_dir,
            "data_file": data_json_path,
            "info_file": dataset_info_path
        }

dataset_orchestrator = DatasetOrchestrator()
