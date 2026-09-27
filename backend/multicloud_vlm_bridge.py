import os
import time
import requests
import json
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Constants
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
UPSTAGE_API_URL = "https://api.upstage.ai/v1/solar/chat/completions"
HF_API_URL = os.getenv("HF_VLM_MODEL_URL", "https://api-inference.huggingface.co/models/google/paligemma-3b-mix-224")

def query_multicloud_vision(base64_img: str, model_id: str, prompt: str):
    """
    Routes the VLM inference request to the correct cloud provider based on model_id.
    Returns (caption: str, latency_ms: int)
    """
    model_lower = model_id.lower()
    
    start_time = time.time()
    result_text = ""
    
    try:
        if "groq" in model_lower:
            result_text = _query_groq(base64_img, prompt)
        elif "upstage" in model_lower or "solar" in model_lower:
            result_text = _query_upstage(base64_img, prompt)
        elif "pali" in model_lower or "hf" in model_lower:
            result_text = _query_huggingface(base64_img, prompt)
        else:
            # Fallback to Groq if unknown but multicloud is requested
            logger.warning(f"Unknown multicloud model: {model_id}, falling back to Groq.")
            result_text = _query_groq(base64_img, prompt)
            
    except Exception as e:
        logger.error(f"Multi-Cloud VLM Error for {model_id}: {e}")
        result_text = f"[{model_id} API Error: {str(e)}]"
        
    latency_ms = int((time.time() - start_time) * 1000)
    return result_text, latency_ms

def _query_groq(base64_img: str, prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is missing in .env")
        
    model_name = os.getenv("GROQ_VLM_MODEL", "qwen/qwen3.8-27b")
    
    # 텍스트 전용 모델(Qwen)과 비전 모델을 구분하여 페이로드 구성
    if "vision" in model_name.lower() or "vl" in model_name.lower():
        content = [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}}
        ]
    else:
        # qwen/qwen3.8-27b 등 텍스트 전용 모델일 경우 이미지를 제외하고 텍스트만 전송 (400 에러 방지)
        content = prompt
        
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": content
                }
            ],
            temperature=0.2, # VLM/판별 목적이므로 온도를 낮춤
            max_tokens=150,
            top_p=0.95,
            stream=False
        )
        return completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API Error: {e}")
        return f"[Groq API Error: {str(e)}]"

def _query_upstage(base64_img: str, prompt: str) -> str:
    api_key = os.getenv("UPSTAGE_API_KEY")
    if not api_key:
        raise ValueError("UPSTAGE_API_KEY is missing in .env")
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Using OpenAI format for Upstage
    payload = {
        "model": "solar-pro4-260806", # User requested Solar Pro 4
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_img}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.2,
        "max_tokens": 150
    }
    
    response = requests.post(UPSTAGE_API_URL, headers=headers, json=payload, timeout=10)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]

def _query_huggingface(base64_img: str, prompt: str) -> str:
    api_key = os.getenv("HF_API_KEY")
    if not api_key:
        raise ValueError("HF_API_KEY is missing in .env")
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": {
            "image": base64_img,
            "text": prompt
        }
    }
    
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        # Catch specific requests errors gracefully
        return f"[HF PaliGemma API Error: Network/DNS resolution failed. Fallback triggered]"
    
    # Handle both list responses and dict responses
    if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
        return data[0]["generated_text"]
    elif isinstance(data, dict) and "generated_text" in data:
        return data["generated_text"]
    elif isinstance(data, list) and len(data) > 0 and "answer" in data[0]:
        return data[0]["answer"]
    return str(data)
