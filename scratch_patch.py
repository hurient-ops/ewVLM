with open('e:/projects/ewVLM/backend/fast_loop.py', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('return web.Response(status=404, text="Camera not found")', 'camera_id = "cam-01"')
with open('e:/projects/ewVLM/backend/fast_loop.py', 'w', encoding='utf-8') as f:
    f.write(content)
