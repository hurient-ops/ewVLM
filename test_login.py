import requests

try:
    r = requests.post('http://localhost:8000/api/v1/auth/login', json={'username':'admin', 'password':'admin123!'})
    print(r.status_code)
    print(r.json())
except Exception as e:
    print(e)
