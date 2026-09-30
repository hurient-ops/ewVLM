import requests

try:
    r = requests.post('http://localhost:8000/api/v1/groups', json={'id':'g-test','name':'Test Group','description':'test'})
    print(r.status_code)
    print(r.text)
except Exception as e:
    print(e)
