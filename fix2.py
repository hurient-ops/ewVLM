with open('e:/projects/ewVLM/backend/fast_loop.py', 'rb') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if b'asyncio.to_thread(model.track' in line:
        lines[i] = b'                results = await asyncio.to_thread(model.track, frame, persist=True, tracker="bytetrack.yaml", verbose=False)\r\n'
with open('e:/projects/ewVLM/backend/fast_loop.py', 'wb') as f:
    f.writelines(lines)
