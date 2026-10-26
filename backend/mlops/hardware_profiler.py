import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger("HardwareProfiler")

class HardwareProfiler:
    """
    관제 서버의 GPU 및 VRAM 용량을 자동 감지하여,
    하드웨어 변경 시 최적의 VLM(PaliGemma, Qwen2-VL, Llama 3.2 Vision, Upstage Solar)과
    학습/추론 하이퍼파라미터를 동적으로 자동 구성하는 프로파일러.
    """
    
    # 지원 VLM 모델 패밀리 정의
    MODEL_PROFILES = {
        "qwen2_vl_7b": {
            "name": "Qwen2-VL 7B Instruct",
            "hub_id": "Qwen/Qwen2-VL-7B-Instruct",
            "template": "qwen2_vl",
            "min_vram_gb": 5.5,
            "recommended_vram_gb": 8.0,
            "quantization": 4,
            "description": "다목적 고성능 비전-언어 모델. 6GB VRAM에서 4-bit QLoRA로 안정 구동."
        },
        "paligemma_3b": {
            "name": "Google PaliGemma 2 3B",
            "hub_id": "google/paligemma-3b-pt-448",
            "template": "paligemma",
            "min_vram_gb": 4.0,
            "recommended_vram_gb": 6.0,
            "quantization": 4,
            "description": "초경량 초고속 VQA 엣지 모델. 저사양/임베디드 하드웨어 최적화."
        },
        "solar_10b": {
            "name": "Upstage Solar 10.7B / Solar-Pro",
            "hub_id": "upstage/solar-10.7b-instruct",
            "template": "solar",
            "min_vram_gb": 8.0,
            "recommended_vram_gb": 12.0,
            "quantization": 4,
            "description": "한국어 및 도메인 지침 준수에 특화된 고성능 모델. (8GB~12GB VRAM 권장)"
        },
        "llama_3_2_vision_11b": {
            "name": "Meta Llama 3.2 11B Vision Instruct",
            "hub_id": "meta-llama/Llama-3.2-11B-Vision-Instruct",
            "template": "mllama",
            "min_vram_gb": 12.0,
            "recommended_vram_gb": 24.0,
            "quantization": 4,
            "description": "최상급 비전 추론 모델. 멀티 이미지 시퀀스 및 정밀 보안 포렌식 특화. (16GB+ VRAM 권장)"
        }
    }

    def detect_hardware(self) -> Dict[str, Any]:
        """현재 시스템의 GPU 모델명과 VRAM(GB)을 실시간 감지"""
        gpu_avail = False
        gpu_name = "CPU Only"
        vram_gb = 0.0

        try:
            import torch
            gpu_avail = torch.cuda.is_available()
            if gpu_avail:
                gpu_name = torch.cuda.get_device_name(0)
                props = torch.cuda.get_device_properties(0)
                vram_gb = round(props.total_memory / (1024**3), 2)
        except Exception as e:
            logger.warning(f"Failed to query torch.cuda: {e}")

        # VRAM 기반 티어 분류
        if vram_gb >= 30.0:
            tier = "ULTRA_SERVER_32GB" # RTX 5090 32GB, RTX 6000 Ada 48GB, A100 40GB/80GB (Tri-Model Ensemble 가용)
        elif vram_gb >= 20.0:
            tier = "ENTERPRISE"        # RTX 3090 / 4090 / A100 (24GB)
        elif vram_gb >= 11.0:
            tier = "ADVANCED"          # RTX 3060 12GB / RTX 4070 12GB / 4080 16GB
        elif vram_gb >= 5.5:
            tier = "MAINSTREAM_ENTRY"  # GTX 1660S / RTX 2060 (6GB)
        else:
            tier = "LOW_OR_CPU"        # < 6GB or CPU

        return {
            "gpu_available": gpu_avail,
            "gpu_name": gpu_name,
            "vram_gb": vram_gb,
            "hardware_tier": tier,
            "supports_tri_ensemble": (vram_gb >= 30.0)
        }

    def get_adaptive_vlm_recommendation(self) -> Dict[str, Any]:
        """하드웨어 감지 결과에 따라 최적의 VLM 모델과 하이퍼파라미터 자동 선택"""
        hw = self.detect_hardware()
        vram = hw["vram_gb"]

        if vram >= 30.0:
            # 32GB+ 초고성능 환경: 3대 모델(PaliGemma, Llama 3.2 11B Vision, Upstage Solar) 동시 로드 앙상블 가동
            default_key = "tri_model_ensemble"
            recommended_model = {
                "name": "Tri-Model Ensemble (PaliGemma + Llama 3.2 11B + Solar)",
                "hub_id": "ensemble/paligemma+llama3.2+solar",
                "template": "mllama",
                "mode": "TRI_CONCURRENT_RESIDENT",
                "description": "32GB+ VRAM 전용: 1차(PaliGemma 엣지 필터) -> 2차(Llama 3.2 정밀 시각 추론) -> 3차(Upstage Solar 한국어 SOP 보고서) 3개 모델 동시 로딩 파이프라인.",
                "pipeline": [
                    {"step": 1, "role": "엣지 오탐 필터링 (0.05s)", "model": "Google PaliGemma 2 3B", "vram_est": "~3GB"},
                    {"step": 2, "role": "다중 프레임 시각 심층 포렌식", "model": "Meta Llama 3.2 11B Vision", "vram_est": "~14GB"},
                    {"step": 3, "role": "한국어 지침/SOP 보고서 생성", "model": "Upstage Solar-10.7B / Solar-Pro", "vram_est": "~11GB"}
                ],
                "total_vram_requirement_gb": 28.0
            }
            batch_size = 2
            grad_accum = 2
            quant_bit = 4
        elif vram >= 20.0:
            # 24GB (RTX 4090 / A100): Llama 3.2 11B Vision 또는 Solar Pro 풀파워 구동
            default_key = "llama_3_2_vision_11b"
            recommended_model = self.MODEL_PROFILES[default_key]
            batch_size = 2
            grad_accum = 2
            quant_bit = 4
        elif vram >= 10.0:
            # 12GB ~ 16GB (RTX 4070 등): Upstage Solar 또는 Qwen2-VL 7B 넉넉한 구동
            default_key = "solar_10b"
            recommended_model = self.MODEL_PROFILES[default_key]
            batch_size = 1
            grad_accum = 4
            quant_bit = 4
        elif vram >= 5.5:
            # 6GB (현재 GTX 1660 Super): Qwen2-VL 7B 또는 PaliGemma-3B 최적화 구동
            default_key = "qwen2_vl_7b"
            recommended_model = self.MODEL_PROFILES[default_key]
            batch_size = 1
            grad_accum = 4
            quant_bit = 4
        else:
            # 저사양 엣지/CPU: PaliGemma-3B 최경량
            default_key = "paligemma_3b"
            recommended_model = self.MODEL_PROFILES[default_key]
            batch_size = 1
            grad_accum = 8
            quant_bit = 4

        return {
            "hardware": hw,
            "recommended_key": default_key,
            "recommended_model": recommended_model,
            "training_hyperparameters": {
                "batch_size": batch_size,
                "gradient_accumulation_steps": grad_accum,
                "quantization_bit": quant_bit,
                "learning_rate": 2e-4,
                "lora_rank": 16,
                "lora_alpha": 32,
                "fp16": True
            },
            "all_supported_models": self.MODEL_PROFILES
        }

hardware_profiler = HardwareProfiler()
