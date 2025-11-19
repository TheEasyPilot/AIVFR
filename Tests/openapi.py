import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key_openaip = os.getenv("OPENAIP_API_KEY")
api_key_wx = os.getenv("CHECKWXAPI_API_KEY")
api_key_api_ninjas = os.getenv("API_NINJAS_API_KEY")
api_key_openai = os.getenv("OPENAI_API_KEY")

'''

url = "https://api.checkwx.com/taf/EGLL/decoded"

response = requests.request("GET", url, headers={'X-API-Key': api_key_wx})

print(response.json())

'''
# Correct header for public API
header = {
    "x-openaip-api-key": api_key_openaip
}

params = {
    "country": "GB",
    "fields" : "name,geometry.coordinates",
    "pos" : "51.722,0.154",
    "pos" : "51.5074,-0.1278",
    "dist" : 37040
}

url = "https://api.core.openaip.net/api/reporting-points"

response = requests.get(url, headers=header, params=params)

data = response.json()

# Basic info
print(data)