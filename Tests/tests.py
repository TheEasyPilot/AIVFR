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


url = "https://api.checkwx.com/metar/EGLL/decoded"

response = requests.request("GET", url, headers={'X-API-Key': api_key_wx})
#parse response
data = response.json()
data = data["data"][0]


print(data)