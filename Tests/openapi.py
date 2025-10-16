import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key_openaip = os.getenv("OPENAIP_API_KEY")
api_key_wx = os.getenv("CHECKWXAPI_API_KEY")

# Correct header for public API
headers = {
    "x-openaip-api-key": api_key_openaip
}

params = {
    "search": "KDEN"
}

url = "https://api.core.openaip.net/api/airports"

response = requests.get(url, headers=headers, params=params)

print("Status Code:", response.status_code)
print("Raw Response:", response.text)

data = response.json()
airport = data["items"][0]  # We searched EGSS, so only one result

# Basic info
name = airport["name"]
icao = airport["icaoCode"]
iata = airport.get("iataCode", "N/A")
coords = airport["geometry"]["coordinates"]  # [lon, lat]
elevation_ft = airport["elevation"]["value"]
country = airport["country"]
variation = airport["magneticDeclination"]

print(f"Airport: {name} ({icao} / {iata})")
print(f"Country: {country}")
print(f"Elevation: {elevation_ft} ft")
print(f"Location: Lat {coords[1]}, Lon {coords[0]}")
print(f"variation: {variation}")

# Frequencies
print("\nFrequencies:")
for freq in airport["frequencies"]:
    print(f" - {freq['name']}: {freq['value']} MHz")

# Runways
print("\nRunways:")
for rw in airport["runways"]:
    print(f" - Runway {rw['designator']}: {rw['dimension']['length']['value']}m x {rw['dimension']['width']['value']}m")

'''

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