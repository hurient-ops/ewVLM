import os

file_path = 'e:/projects/ewVLM/backend/multicloud_vlm_bridge.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Groq (Revert to qwen3.8-27b text payload)
old_groq = '''    payload = {
        "model": "llama-3.2-11b-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}}
                ]
            }
        ],
        "temperature": 0.2,
        "max_tokens": 150
    }'''
new_groq = '''    payload = {
        "model": "qwen/qwen3.8-27b",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.2,
        "max_tokens": 150
    }'''
content = content.replace(old_groq, new_groq)

# Fix Upstage (Use solar-pro4-260806)
old_upstage = '''        "model": "solar-1-mini-chat", # Valid Upstage chat model'''
new_upstage = '''        "model": "solar-pro4-260806", # User requested Solar Pro 4'''
content = content.replace(old_upstage, new_upstage)

# Fix Hugging Face (Use paligemma-3b-mix-224)
old_hf = '''HF_API_URL = "https://api-inference.huggingface.co/models/google/paligemma-3b-mix-448"'''
new_hf = '''HF_API_URL = "https://api-inference.huggingface.co/models/google/paligemma-3b-mix-224"'''
content = content.replace(old_hf, new_hf)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
