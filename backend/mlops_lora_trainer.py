import os
import json
import logging
import asyncio
import time

logger = logging.getLogger("ewVLMMLOps")

async def run_lora_finetuning(job_id: int, target_model: str, progress_callback=None):
    """
    Simulates a realistic LoRA fine-tuning loop and saves adapter weights.
    In a real-world scenario, this would import torch, transformers, and peft.
    """
    logger.info(f"[MLOps] Starting LoRA fine-tuning for Job {job_id} on model: {target_model}")
    
    # 1. 훈련 루프 시뮬레이션
    total_epochs = 50
    steps_per_epoch = 10
    
    start_time = time.time()
    
    for epoch in range(1, total_epochs + 1):
        for step in range(1, steps_per_epoch + 1):
            loss = max(0.1, 2.5 * (0.8 ** epoch) * (0.95 ** step)) # 가짜 손실 함수
            logger.info(f"[MLOps Job {job_id}] Epoch {epoch}/{total_epochs} | Step {step}/{steps_per_epoch} | Loss: {loss:.4f}")
            
            if progress_callback:
                if asyncio.iscoroutinefunction(progress_callback):
                    await progress_callback(epoch, total_epochs, step, steps_per_epoch, loss)
                else:
                    progress_callback(epoch, total_epochs, step, steps_per_epoch, loss)
                    
            await asyncio.sleep(0.1) # Simulate compute time per step
            
    end_time = time.time()
    logger.info(f"[MLOps] Training completed in {end_time - start_time:.2f} seconds.")
    
    # 2. 어댑터 저장 시뮬레이션 (Graceful Downgrade to file generation)
    save_dir = os.path.join(os.path.dirname(__file__), "models", "lora_adapters", f"job_{job_id}")
    os.makedirs(save_dir, exist_ok=True)
    
    # adapter_config.json
    adapter_config = {
        "alpha_pattern": {},
        "auto_mapping": None,
        "base_model_name_or_path": target_model,
        "bias": "none",
        "fan_in_fan_out": False,
        "inference_mode": True,
        "init_lora_weights": True,
        "layers_pattern": None,
        "layers_to_transform": None,
        "lora_alpha": 32,
        "lora_dropout": 0.05,
        "modules_to_save": None,
        "peft_type": "LORA",
        "r": 16,
        "rank_pattern": {},
        "revision": None,
        "target_modules": [
            "q_proj",
            "v_proj"
        ],
        "task_type": "CAUSAL_LM"
    }
    
    config_path = os.path.join(save_dir, "adapter_config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(adapter_config, f, indent=2)
        
    # adapter_model.safetensors (Dummy physical file 5MB)
    safetensors_path = os.path.join(save_dir, "adapter_model.safetensors")
    try:
        with open(safetensors_path, "wb") as f:
            f.write(os.urandom(1024 * 1024 * 5)) # 5MB of random bytes
        logger.info(f"[MLOps] Successfully saved LoRA adapter to {save_dir}")
    except Exception as e:
        logger.error(f"[MLOps] Failed to save physical adapter weights: {e}")
        
    return save_dir
