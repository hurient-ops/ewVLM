import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

def test_groq():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key: return False, "Missing Key"
    res = requests.get("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {api_key}"})
    if res.status_code == 200: return True, "Valid"
    return False, f"HTTP {res.status_code} - {res.text}"

def test_upstage():
    api_key = os.getenv("UPSTAGE_API_KEY")
    if not api_key: return False, "Missing Key"
    res = requests.get("https://api.upstage.ai/v1/solar/models", headers={"Authorization": f"Bearer {api_key}"})
    if res.status_code == 200: return True, "Valid"
    return False, f"HTTP {res.status_code} - {res.text}"

def test_huggingface():
    api_key = os.getenv("HF_API_KEY")
    if not api_key: return False, "Missing Key"
    res = requests.get("https://huggingface.co/api/whoami-v2", headers={"Authorization": f"Bearer {api_key}"})
    if res.status_code == 200: return True, "Valid"
    return False, f"HTTP {res.status_code} - {res.text}"

if __name__ == "__main__":
    print("API Key Verification Report:")
    print("-" * 30)
    
    g_ok, g_msg = test_groq()
    print(f"Groq API Key        : {'[SUCCESS]' if g_ok else '[FAILED]'} {g_msg}")
    
    u_ok, u_msg = test_upstage()
    print(f"Upstage API Key     : {'[SUCCESS]' if u_ok else '[FAILED]'} {u_msg}")
    
    h_ok, h_msg = test_huggingface()
    print(f"HuggingFace API Key : {'[SUCCESS]' if h_ok else '[FAILED]'} {h_msg}")
