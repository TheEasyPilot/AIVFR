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


# Correct header for public API
header = {
    "x-openaip-api-key": api_key_openaip
}

params = {
    "search": "EGSS"
}

url = "https://api.core.openaip.net/api/airports"

response = requests.get(url, headers=header, params=params)

print("Status Code:", response.status_code)


data = response.json()
airport = data["items"][0]  # We searched EGSS, so only one result

# Basic info
name = airport["name"]
icao = airport["icaoCode"]
print(f"Airport: {name} / {icao}")
'''

from openai import OpenAI

client = OpenAI()
response = client.responses.create(
    model="gpt-4.1",
    input=[
        {
            "role" : "user",
            "content" : "Hey! I'm testing your functionality. Say something! :)"
        }
    ]
)

response = response.output[0].content[0].text
print(response)

