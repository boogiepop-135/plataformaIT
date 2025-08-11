import requests
import json

try:
    # Probar el endpoint de calendar-events
    response = requests.get('http://127.0.0.1:3001/api/calendar-events')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Probar el endpoint de tasks
    response2 = requests.get('http://127.0.0.1:3001/api/tasks')
    print(f"\nTasks Status Code: {response2.status_code}")
    print(f"Tasks Response: {response2.text}")
    
    # Probar el endpoint de tickets
    response3 = requests.get('http://127.0.0.1:3001/api/tickets')
    print(f"\nTickets Status Code: {response3.status_code}")
    print(f"Tickets Response: {response3.text}")
    
except Exception as e:
    print(f"Error: {e}")
