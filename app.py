import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAIP_API_KEY")  # Make sure this is set correctly!

# Correct header for public API
headers = {
    "x-openaip-api-key": api_key
}

params = {
    "search": "EGSS"
}

url = "https://api.core.openaip.net/api/airports"

response = requests.get(url, headers=headers, params=params)

print("Status Code:", response.status_code)

data = response.json()
airport = data["items"][0]  # We searched EGSS, so only one result

# Basic info
name = airport["name"]
icao = airport["icaoCode"]
iata = airport.get("iataCode", "N/A")
coords = airport["geometry"]["coordinates"]  # [lon, lat]
elevation_ft = airport["elevation"]["value"]
country = airport["country"]

print(f"Airport: {name} ({icao} / {iata})")
print(f"Country: {country}")
print(f"Elevation: {elevation_ft} ft")
print(f"Location: Lat {coords[1]}, Lon {coords[0]}")

# Frequencies
print("\nFrequencies:")
for freq in airport["frequencies"]:
    print(f" - {freq['name']}: {freq['value']} MHz")

# Runways
print("\nRunways:")
for rw in airport["runways"]:
    print(f" - Runway {rw['designator']}: {rw['dimension']['length']['value']}m x {rw['dimension']['width']['value']}m")
