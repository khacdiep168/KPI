import urllib.request
import json

SUPABASE_URL = "https://jaewyxazjvqtvqifdmlw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZXd5eGF6anZxdHZxaWZkbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0Mzg0MTgsImV4cCI6MjEwNzAxNDQxOH0.vXxjYEdEvK7HCefzPuKXgcguB4KPRjGkJhHcPF9uW00"

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/users",
    data=json.dumps([{"manv": "TEST01", "name": "Test User", "dept": "IT", "password": "123", "role": "User"}]).encode('utf-8'),
    headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        print("Status:", resp.status)
        print("Response:", resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
