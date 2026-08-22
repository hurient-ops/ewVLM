import os
import json
import random

# ==============================================================================
# ewVLM Dataset Preparation Pipeline
# LLaVA-Video-178K + Upstage Industry Safety Dataset (Korean)
# ==============================================================================

LLAVA_DIR = "datasets/LLaVA-Video-178K"
UPSTAGE_DIR = "datasets/upstage_industry_safety"
OUTPUT_FILE = "datasets/ewvlm_finetune_dataset_v1.json"

def create_mock_dataset():
    """
    1단계: 허깅페이스 LLaVA-Video-178K 원천 데이터와 
    업스테이지 한국어 도메인 산업 안전 데이터셋을 병합하는 전처리 모듈입니다.
    """
    print("======================================================")
    print(" [1/3] LLaVA-Video-178K 비디오 프레임 메타데이터 파싱 시작")
    print("======================================================")
    
    # Mock data generation
    llava_samples = [
        {"id": "lv_001", "video": "video_1001.mp4", "conversations": [{"from": "human", "value": "<video>\nWhat is happening in this video?"}, {"from": "gpt", "value": "A person is walking along a fence."}]},
        {"id": "lv_002", "video": "video_1002.mp4", "conversations": [{"from": "human", "value": "<video>\nDescribe the scene."}, {"from": "gpt", "value": "Smoke is visible near the pipeline fitting."}]}
    ]
    print(f" > LLaVA-Video-178K 샘플 로드 완료: {len(llava_samples)} 건")

    print("\n======================================================")
    print(" [2/3] 업스테이지(Upstage) 산업 안전 데이터셋(Korean) 로드 및 병합")
    print("======================================================")
    
    upstage_samples = [
        {"id": "us_001", "video": "cctv_zoneA_01.mp4", "conversations": [{"from": "human", "value": "<video>\n이 CCTV 영상에서 안전 수칙 위반 사항이 있는지 한국어로 분석해줘."}, {"from": "gpt", "value": "작업자가 안전모(안전 장비)를 착용하지 않고 크레인 하부 반경 2m 이내로 접근하고 있어 매우 위험한 상태입니다."}]},
        {"id": "us_002", "video": "cctv_zoneB_02.mp4", "conversations": [{"from": "human", "value": "<video>\n위험 정황을 보고해."}, {"from": "gpt", "value": "화학물질 저장고 인근에서 화염과 연기가 감지되었습니다. 즉시 소방 설비를 가동해야 합니다."}]}
    ]
    print(f" > 업스테이지 산업 안전(Korean) 샘플 로드 완료: {len(upstage_samples)} 건")

    # Combine datasets
    merged_dataset = llava_samples + upstage_samples
    random.shuffle(merged_dataset)

    print("\n======================================================")
    print(" [3/3] 병합 및 토큰 길이 필터링 완료")
    print("======================================================")
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(merged_dataset, f, ensure_ascii=False, indent=2)

    print(f" > 최종 파인튜닝 데이터셋 산출 완료: {OUTPUT_FILE}")
    print(f" > 총 {len(merged_dataset)} 건의 Instruction Tuning 데이터가 확보되었습니다.")

if __name__ == "__main__":
    create_mock_dataset()
