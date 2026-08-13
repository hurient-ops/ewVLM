import os
import json

src_dir = 'e:/projects/ewVLM/frontend/src'
files = [f for f in os.listdir(src_dir) if f.endswith('.html')]
with open(os.path.join(src_dir, 'file_list.json'), 'w', encoding='utf-8') as f:
    json.dump(files, f, ensure_ascii=False, indent=2)
