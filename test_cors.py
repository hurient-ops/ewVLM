import requests
try:
    r = requests.options('http://localhost:8000/api/v1/auth/login', headers={'Origin': 'http://localhost:5174', 'Access-Control-Request-Method': 'POST'})
    print(r.status_code)
    print(r.headers)
except Exception as e:
    print(e)
