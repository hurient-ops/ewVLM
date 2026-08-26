import requests
print(requests.get('http://localhost:8000/api/v1/cameras').json())
