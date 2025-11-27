import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key_openaip = os.getenv("OPENAIP_API_KEY")
api_key_wx = os.getenv("CHECKWXAPI_API_KEY")
api_key_api_ninjas = os.getenv("API_NINJAS_API_KEY")
api_key_openai = os.getenv("OPENAI_API_KEY")
api_key_ors = os.getenv("ORS_API_KEY")



url = "https://api.openrouteservice.org/v2/directions/driving-car"

headers = {
    "Authorization": api_key_ors,  # Your ORS key
    "Content-Type": "application/json"
}

payload = {
    "coordinates": [
        [51.7472, 0.2394],
        [50.8366, -0.2974]
    ]
}

# Send POST request
response = requests.post(url, headers=headers, json=payload)
response.raise_for_status()
print(response)