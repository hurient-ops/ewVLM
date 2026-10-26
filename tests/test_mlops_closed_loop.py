import os
import sys
import json
import asyncio

# 프로젝트 루트 경로 등록
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

async def run_e2e_closed_loop_test():
    print("=" * 70)
    print("[RUN] [Air-Gapped MLOps In-House Pipeline E2E Verification]")
    print("=" * 70)

    # 1. DB 피드백 생성 검증
    from database import AsyncSessionLocal, engine, Base
    import crud, models
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("\n[단계 1] 관제 피드백(Active Learning) DB 영구 기록 테스트...")
    async with AsyncSessionLocal() as db:
        fb_sample_1 = await crud.create_feedback_log(db, {
            "event_id": "test_esc_1001",
            "camera_id": "CAM-01",
            "feedback_type": "true_positive",
            "original_caption": "외곽 1구역 펜스 월담 침입자 감지",
            "corrected_caption": "외곽 1구역 철조망 월담 작업자 (실제 침입 확인)",
            "corrected_class": "person_intrusion",
            "image_path": "data/snapshots/sample_intrusion.jpg",
            "operator_name": "operator_kim"
        })
        fb_sample_2 = await crud.create_feedback_log(db, {
            "event_id": "test_esc_1002",
            "camera_id": "CAM-02",
            "feedback_type": "false_positive",
            "original_caption": "위험물체 쓰러짐 감지",
            "corrected_caption": "강풍으로 인한 나뭇가지 흔들림 오탐",
            "corrected_class": "normal",
            "image_path": "data/snapshots/sample_tree.jpg",
            "operator_name": "operator_lee"
        })
        print(f"  -> 피드백 로그 생성 완료: ID={fb_sample_1.id}, ID={fb_sample_2.id}")

    # 2. LLaMA-Factory Vision 포맷 데이터셋 빌드 검증
    print("\n[단계 2] LLaMA-Factory Vision 포맷 오프라인 데이터셋 빌드...")
    from mlops.dataset_orchestrator import dataset_orchestrator
    
    async with AsyncSessionLocal() as db:
        result = await dataset_orchestrator.build_llama_factory_dataset(db)
    print(f"  -> 빌드 결과: {result['status']}, 변환 건수: {result.get('total_samples')}건")
    print(f"  -> 데이터셋 파일: {result.get('data_file')}")
    print(f"  -> 메타데이터 파일: {result.get('info_file')}")
    
    assert os.path.exists(result["data_file"]), "데이터셋 파일 생성 실패"
    assert os.path.exists(result["info_file"]), "dataset_info.json 생성 실패"
    
    with open(result["data_file"], "r", encoding="utf-8") as f:
        data = json.load(f)
        print(f"  -> 생성된 샘플 데이터 (첫 1건): {json.dumps(data[0] if data else {}, indent=2, ensure_ascii=False)}")

    # 3. LoRA 어댑터 핫스왑 및 실시간 fast_loop 반영 검증
    print("\n[단계 3] LoRA 어댑터 무중단 핫스왑(Hot-Swap) 및 OSD 연동 검증...")
    from mlops.adapter_manager import adapter_manager
    from fast_loop import get_current_active_adapter_name
    
    # 가상 테스트 어댑터 생성
    test_adapter_dir = os.path.join(BASE_DIR, "models", "lora_adapters", "ewvlm_intrusion_v1_lora")
    os.makedirs(test_adapter_dir, exist_ok=True)
    with open(os.path.join(test_adapter_dir, "adapter_config.json"), "w", encoding="utf-8") as f:
        json.dump({"base_model_name_or_path": "Qwen/Qwen2-VL-7B-Instruct", "r": 16, "lora_alpha": 32}, f)
    with open(os.path.join(test_adapter_dir, "adapter_model.safetensors"), "wb") as f:
        f.write(b"MOCK_LORA_WEIGHTS_FOR_TESTING")
        
    adapters = adapter_manager.list_available_adapters()
    print(f"  -> 발견된 어댑터 목록 ({len(adapters)}개): {[a['adapter_name'] for a in adapters]}")
    
    # 핫스왑 활성화
    swap_res = adapter_manager.activate_adapter("ewvlm_intrusion_v1_lora")
    print(f"  -> 핫스왑 적용 결과: {swap_res['status']} ({swap_res['message']})")
    
    # fast_loop에서 실시간 반영 확인
    active_in_fast_loop = get_current_active_adapter_name()
    print(f"  -> fast_loop OSD 표출 어댑터명: [{active_in_fast_loop}]")
    assert active_in_fast_loop == "ewvlm_intrusion_v1_lora", "fast_loop 어댑터 핫스왑 반영 실패"

    # 4. LLaMA-Factory 0.9.6 설치 및 오프라인 트레이닝 엔진 구조 검증
    print("\n[단계 4] LLaMA-Factory 0.9.6 및 인하우스 트레이닝 엔진 검증...")
    from mlops.inhouse_train_engine import inhouse_train_engine
    import llamafactory
    print(f"  -> LLaMA-Factory 버전: {llamafactory.__version__}")
    
    status = inhouse_train_engine.get_status()
    print(f"  -> 트레이닝 엔진 현재 상태: {status['status']}, GPU: {status['gpu_available']}")
    
    # 5. 하드웨어 적응형 VLM 프로파일러 (PaliGemma, Qwen2-VL, Llama 3.2, Solar) 검증
    print("\n[단계 5] 하드웨어 적응형 VLM 동적 프로파일링 검증...")
    from mlops.hardware_profiler import hardware_profiler
    hw_info = hardware_profiler.get_adaptive_vlm_recommendation()
    print(f"  -> 감지된 GPU: {hw_info['hardware']['gpu_name']} (VRAM: {hw_info['hardware']['vram_gb']}GB, Tier: {hw_info['hardware']['hardware_tier']})")
    print(f"  -> 자동 추천 VLM: {hw_info['recommended_model']['name']} ({hw_info['recommended_model']['hub_id']})")
    print(f"  -> 지원되는 멀티 아키텍처 모델 수: {len(hw_info['all_supported_models'])}종 (Qwen2-VL, PaliGemma, Solar, Llama 3.2 Vision)")

    print("\n" + "=" * 70)
    print("[SUCCESS] All verifications passed! Air-Gapped MLOps Pipeline Ready.")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_e2e_closed_loop_test())
