import json
import os
import re
import urllib.request

input_file = r'C:\Users\COMPANY\.gemini\antigravity-ide\brain\7d5fd566-f717-42ba-85a3-c7c57fea4906\.system_generated\steps\142\output.txt'
out_dir = r'e:\projects\ewVLM\frontend\src'

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

existing_files = set(os.listdir(out_dir))

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

count = 0
for s in data.get('screens', []):
    url = s.get('htmlCode', {}).get('downloadUrl')
    if not url:
        continue
    
    title = s.get('title', '')
    name = s.get('name', '')
    screen_id = name.split('/')[-1]
    
    clean_title = re.sub(r'[\\/*?:"<>|]', '', title).strip()
    if not clean_title:
        filename = f'{screen_id}.html'
    else:
        filename = f'{clean_title}_{screen_id}.html'
        
    if filename in existing_files:
        continue # Skip already downloaded files
        
    out_path = os.path.join(out_dir, filename)
    
    try:
        urllib.request.urlretrieve(url, out_path)
        count += 1
        print(f"Downloaded new screen: {filename}")
    except Exception as e:
        print(f'Failed to download {filename}: {e}')

if count == 0:
    print('No new screens found.')
else:
    print(f'Successfully downloaded {count} new files.')
