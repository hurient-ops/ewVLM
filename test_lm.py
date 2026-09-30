import requests
try:
    print(requests.get('http://localhost:1234/v1/models').json())
except Exception as e:
    print("Error:", e)
