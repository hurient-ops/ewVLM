with open('e:/projects/ewVLM/backend/fast_loop.py', 'rb') as f:
    c = f.read()
c = c.replace(b'tracker="bytetrack.yaml\\, verbose=False)', b'tracker="bytetrack.yaml", verbose=False)')
with open('e:/projects/ewVLM/backend/fast_loop.py', 'wb') as f:
    f.write(c)
