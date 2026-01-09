from flask import Blueprint, render_template, session, jsonify, request
from math import radians, degrees, sin, asin, cos, sqrt
import os, pint, requests
from openai import OpenAI
from dotenv import load_dotenv
from .ai_roles import fetchRole

main = Blueprint('app', __name__)

APP_VERSION = "0.1.0-alpha"

#------------------------------------------WEBTOOL NAVIGATION-------------------------------------
#main menu
@main.route('/') #this will be the first to load up
def index():
    if "flight_data" not in session: #initialise the session if not created already
        session["flight_data"] = data_template.copy()
        update_units()
    return render_template('menu.html', APP_VERSION="0.1.1-alpha", data=session["flight_data"], settings=session["flight_data"]["settings"])

#settings menu
@main.route('/settings')
def settingsMenu():
    return render_template('settings.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#dashboard
@main.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#Route tab
@main.route('/route')
def routeTab():
    return render_template('route.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#weather tab
@main.route('/weather')
def weatherTab():
    return render_template('weather.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#navigation log tab
@main.route('/navlog')
def navlogTab():
    return render_template('navlog.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#fuel tab
@main.route('/fuel')
def fuelTab():
    return render_template('fuel.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#mass and balance tab
@main.route('/mass-and-balance')
def massAndBalanceTab():
    return render_template('mass_and_balance.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#performance tab
@main.route('/performance')
def performanceTab():
    return render_template('performance.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#-------------DEBUGGING

#debug route that allows me to see the flight data at any time
@main.route('/debug')
def debug_session():
    return jsonify(session.get("flight_data", {}))
#-------------------------------------------------UNITS CHANGING-------------------------------------

ureg = pint.UnitRegistry()
ureg.formatter.default_format = "~" #use the shortened version by default


UNIT_MAP = { #maps all units to a base unit and a unit and the corresponding settings key
    #for the unit that will actually be displayed
    "distance": {"base": ureg.nautical_mile, "settings_key": "units_distance"},
    "altitude": {"base": ureg.feet, "settings_key": "units_altitude"},
    "airspeed": {"base": ureg.knot, "settings_key": "units_airspeed"},
    "mass": {"base": ureg.kilogram, "settings_key": "units_mass"},
    "fuel": {"base": ureg.litre, "settings_key": "units_fuel"},
}

def update_units():
    units_changed = session["flight_data"]["settings"].get("units_changed", "False") == "True"
    for key, item in session["flight_data"]["flight"].items():
        if isinstance(item, dict) and "class" in item:
            category = item["class"]
            if category in UNIT_MAP:
                settings_key = UNIT_MAP[category]["settings_key"]
                display_unit = session["flight_data"]["settings"][settings_key]
                current_unit = ureg[display_unit]

                #Store previous unit in session settings if not present
                prev_unit_key = f"prev_{settings_key}"
                if prev_unit_key not in session["flight_data"]["settings"]:
                    session["flight_data"]["settings"][prev_unit_key] = display_unit

                if units_changed:
                    #Convert value from previous unit to new unit
                    prev_unit = session["flight_data"]["settings"].get(prev_unit_key, display_unit)
                    try:
                        prev_quantity = item["value"] * ureg[prev_unit]
                        new_quantity = prev_quantity.to(current_unit)
                        item["value"] = float(new_quantity.magnitude)
                    except Exception:
                        pass 
                    #Update previous unit to current
                    session["flight_data"]["settings"][prev_unit_key] = display_unit

                #Always update output
                canonical = item["value"] * current_unit
                converted = canonical.to(current_unit)
                unit_name = str(converted.units)
                unit_name = CUSTOM_UNITS.get(unit_name, unit_name)
                item["output"] = f"{converted.magnitude:.1f} {unit_name}"

    #Reset the flag to show units have been updated
    session["flight_data"]["settings"]["units_changed"] = "False"
    session.modified = True

#using custom units cus the default ones are weird
CUSTOM_UNITS = {
    'nmi' : "NM",
    'knot' : "kts",
    'kg' : "kg",
    'lb' : "lbs",
    'l' : "L",
    'gal' : "Gal",
    'feet' : "ft",
    'meter' : "m",
    'kilometer' : "km",
    'smi' : "miles",
}

@main.route('/units-update')
def update_unitsRUN():
    if session["flight_data"]["settings"]["units_changed"] == "True":
        update_units()
        session["flight_data"]["settings"]["units_changed"] = "False"
        session.modified = True
        return 'updated', 200
    
    else:
        update_units()
        return 'no change', 200


#-------------------------------------------FLIGHT DATA AND SESSION MANAGEMENT------------------------------------

#making the template to store flight data during a session
#also allows setting default values

data_template = {
    "settings" : {"theme": "light",
                  "map_style": "normal",
                  "units_changed": "False",
                  "units_airspeed" : "knot",
                  "units_altitude" : "feet",
                  "units_mass": "kilogram",
                  "units_fuel" : "litre",
                  "units_distance" : "nautical_mile",
                  "waypoint_addType" : "City/Town",
                  "current_page" : ""
                  },
    "flight" : {
        #-----------------------ROUTE
        "saved" : "False",
        "departureAirport_code" : "",
        "departureAirport_name" : "",
        "destinationAirport_code" : "",
        "destinationAirport_name" : "",
        "alternateAirport_code" : "",
        "alternateAirport_name" : "",
        "alternateAirport_coords" : [],
        "add_index" : -1,
        "route" : [],
        "route_names" : [],
        "route_gen_justification" : "",
        "distance" : {"value" : 0, "class" : "distance"},
        "time" : "",
        #-----------------------WEATHER
        #-----Searched airport
        "WX_airportCode" : "",
        "WX_airportName" : "",
        "METAR_searched" : "",
        "TAF_searched" : "",
        "METAR_searched_decoded" : "",
        "TAF_searched_decoded" : "",
        "METAR_searched_grading" : "",
        #-----Departure airport
        "WX_switch_dep" : "METAR",
        "METAR_departure" : "",
        "TAF_departure" : "",
        "METAR_departure_decoded" : "",
        "TAF_departure_decoded" : "",
        "METAR_departure_grading" : "",
        #-----Arrival airport
        "WX_switch_arr" : "METAR",
        "METAR_arrival" : "",  
        "TAF_arrival" : "",
        "METAR_arrival_decoded" : "",
        "TAF_arrival_decoded" : "",
        "METAR_arrival_grading" : "",
        #-----------------------NAVLOG
        "route_changed" : "False",
        "separate_distances" : [], #distances for each point
        "separate_bearings" : [], #bearings for each point
        "alternate_track" : 0,
        "alternate_distance" : 0,
        "variation" : 0,
        "NAVLOG" : {
            "headers" : ["FROM/TO", "MSA", "ALT PLAN (FT)", "TAS", "TRACK (°T)", "Wind DIR (°)", "Wind SPD (KT)", "HDG (°T)", "HDG (°M)", "GS (KT)", "DIST (NM)", "TIME (Min)"],
            "rows" : []
        },
        #-----------------------FUEL
        #FUEL POLICY - general policy as default
        "fuelPolicy_trip" : {
            "policy" : "Take-off to Landing. Should consider steep climbs, descents and arrival procedures.",
            "time_allowed" : "",
        },
        "fuelPolicy_contingency" : {
            "policy" : "Either 5% of Trip, 3% if Enroute alternative aerodrome available, or Whatever is sufficient for 20min of flight. Whichever higher.",
            "time_allowed" : "",
        },
        "fuelPolicy_alternate" : {
            "policy" : "For Missed approaches / landing at alternative aerodromes. Should include time for a circuit at destination.",
            "time_allowed" : "",
        },
        "fuelPolicy_finalReserve" : {
            "policy" : "Enough for 45 min Flight time",
            "time_allowed" : "",
        },
        "fuelPolicy_additional" : {
            "policy" : "Enough for 15 mins holding time",
            "time_allowed" : "",
        },
        #FUEL VALUES - NON EDITABLE#
        "fuel_total" : {"value" : 0, "class" : "fuel"},
        "fuel_taxi" : {"value" : 0, "class" : "fuel"},
        "fuel_trip" : {"value" : 0, "class" : "fuel"},
        "fuel_contingency" : {"value" : 0, "class" : "fuel"},
        "fuel_alternate" : {"value" : 0, "class" : "fuel"},
        "fuel_finalReserve" : {"value" : 0, "class" : "fuel"},
        "fuel_additional" : {"value" : 0, "class" : "fuel"},
        "fuel_endurance" : "",
        "fuel_mass" : {"value" : 0, "class" : "mass"},
        #EDITABLE PARAMETERS#
        "fuel_extra" : {"value" : 0, "class" : "fuel"},
        "fuel_burn" : {"value" : 0, "class" : "fuel"},
        "specific_gravity" : "",
        "max_tank_capacity" : {"value" : 0, "class" : "fuel"},
        "taxi_time" : "",

        #---------------------PERFORMANCE
        "TODR" : 0,
        "LDR" : 0,
        "TODA" : 0,
        "LDA" : 0,

    }
}
#--------------------------------UPDATING/MODIFYING DATA

#Updating Settings data
@main.route("/update-settings", methods=["POST"])
def update_settings():
    key = request.json.get("key")
    value = request.json.get("value")
    session["flight_data"]["settings"][key] = value
    if key.startswith("units_"):
        session["flight_data"]["settings"]["units_changed"] = "True" #flag to show units have changed
    session.modified = True

    return jsonify(session["flight_data"])

#Updating flight data
@main.route("/update-flight", methods=["POST"])
def update_flight():
    key = request.json.get("key")
    value = request.json.get("value")

    target = session["flight_data"]["flight"]
    keys = key.split(".")

    #allowing paths (for items like distance.value)
    for k in keys[:-1]:
        if k not in target or not isinstance(target[k], dict):
            return jsonify({"error": "Invalid key path"}), 400
        target = target[k]

    target[keys[-1]] = value

    update_units() #update units in case a unit value was changed
    session.modified = True
    return jsonify(session["flight_data"])
#--------------------------------------------READING DATA

@main.route("/get-settings", methods=["GET"])
def get_settings():
    return jsonify(session["flight_data"]["settings"])

@main.route("/get-flight", methods=["GET"])
def get_flight():
    return jsonify(session["flight_data"]["flight"])

@main.route("/get-all", methods=["GET"])
def get_all():
    return jsonify(session["flight_data"])

#--------------------------------------------IMPORTING DATA

@main.route("/load-flight", methods=["POST"])
def load_flight():
    try: #try block allows me to catch any errors and display them on the page
        New_data = request.get_json()
        if not isinstance(New_data, dict):
            #raise an error if the data is not a dictionary
            raise ValueError("Invalid data format")
        
        #replace the current session data with the new data
        session.clear()
        session.update(New_data)
        update_units() #update units in case the loaded data has different units
        session.modified = True

        return jsonify({"status": "success", "message": "Flight data loaded successfully."}), 200
    except Exception as error:
        return jsonify({"status": "error", "message": str(error)}), 400

#----------------------------------------------EXPORTING DATA

#saves the current flight data as a json file
@main.route("/save-flight")
def save_flight():
    return jsonify(dict(session))

#-----------------------------------------STARTING A NEW FLIGHT

#resets all flight data  but NOT settings
@main.route("/new-flight")
def NewFlightRun():
    while session["flight_data"]["flight"] != data_template["flight"]:
        session["flight_data"]["flight"] = data_template["flight"]
    update_unitsRUN()
    session.modified = True
    return jsonify({"status": "success"}), 200
    
#shows any errors on the actual page
if __name__ == '__main__':
    main.run()


#--------------------------------------------------API FUNCTIONS------------------------------------------------

#get all the relevant API keys from the .env file
load_dotenv()
api_key_openaip = os.getenv("OPENAIP_API_KEY")
api_key_maptiler = os.getenv("MAPTILER_API_KEY")
api_key_jawg = os.getenv("JAWG_API_KEY")
api_key_api_ninjas = os.getenv("API_NINJAS_API_KEY")
api_key_wx = os.getenv("CHECKWXAPI_API_KEY")

#-------------------------------------FETCHING AIRPORT DETAILS
@main.route("/fetch-airport-details", methods=["POST"])
def fetch_airport_details():
    code = request.json.get("code") #get the ICAO code from the request

    headers = {
        "x-openaip-api-key": api_key_openaip #correct header for OpenAIP API
    }
    params = {
        "search": str(code) #using the code from the request
    }

    url = "https://api.core.openaip.net/api/airports"

    response = requests.get(url, headers=headers, params=params) #make the request to the API
    data = response.json() #parse the response as JSON
    airport = data["items"][0]

    #taking just the relevant information
    icao_code = airport["icaoCode"]
    name = airport["name"]
    country = airport["country"]
    coordinates = airport["geometry"]["coordinates"]

    if icao_code != code:
        return jsonify({"error": "ICAO code does not match"}), 400

    return jsonify({"name": name, "country": country, "coordinates": coordinates}), 200

#------------------------------------------ROUTE MAP

#Send the API keys to frontend
@main.route("/get-api-keys")
def get_api_keys():
    return jsonify({
        "openaip": api_key_openaip,
        "maptiler": api_key_maptiler,
        "jawg": api_key_jawg
    }), 200

#----------------------------------------FINDING CITY COORDS

@main.route("/get-cityCoords", methods=["POST"])
def get_cityCoords():
    city = request.json.get("city")
    api_url = 'https://api.api-ninjas.com/v1/city?name={}'.format(city)
    response = requests.get(api_url, headers={'X-Api-Key': api_key_api_ninjas})

    if response.status_code == requests.codes.ok:
        data = response.json()
        if data:
            city_info = data[0]  #Get the first matching city
            #get the necessary info
            name = city_info.get('name')
            country = city_info.get('country')
            latitude = city_info.get('latitude')
            longitude = city_info.get('longitude')

            #check for a matching city in the UK
            if name.lower() == city.lower() and country == "GB":
                return jsonify({
                    "name": name,
                    "coordinates" : [latitude, longitude]
                }), 200
        else:
            return jsonify({"error": "City not found"}), 400
    else:
        return jsonify({"error": "City not found"}), 400
    
#---------------------------------------FINDING COORDINATES OF AIRPORTS, NAVAIDS AND VRPs

@main.route("/get-avCoords", methods=["POST"])
def get_avCoords():
    data = request.json.get("data")

    headers = {
        "x-openaip-api-key": api_key_openaip #correct header for OpenAIP API
    }
    params = {
        "search": str(data)
    }

    #search for all 3 items
    urlAirports = "https://api.core.openaip.net/api/airports"
    urlNavaids = "https://api.core.openaip.net/api/navaids"
    urlVrps = "https://api.core.openaip.net/api/reporting-points"

    response_airports = requests.get(urlAirports, headers=headers, params=params)
    response_navaids = requests.get(urlNavaids, headers=headers, params=params)
    response_vrps = requests.get(urlVrps, headers=headers, params=params)

    data_airports = response_airports.json() #parse the response as JSON
    data_navaids = response_navaids.json()
    data_vrps = response_vrps.json()

    #first, check if the entered data is an airport
    try:
        airport = data_airports["items"][0]
        icao_code = airport["icaoCode"]
        if icao_code == data:
            return jsonify({"name": airport["icaoCode"], "coordinates" : airport["geometry"]["coordinates"]}), 200
    #^^no need to verify country as already done in Verify ICAO
    
    #if that doesnt work check if its a navaid
    except (IndexError, KeyError):
        try:
            navaid = data_navaids["items"][0]
            navaid_name = navaid["name"]
            navaid_country = navaid["country"]
            navaid_identifier = navaid["identifier"]
            if navaid_name == data or navaid_identifier == data:
                if navaid_country == 'GB':
                    return jsonify({"name": navaid["identifier"], "coordinates" : navaid["geometry"]["coordinates"]}), 200
                else:
                    return jsonify({"error": "Point not found in UK database"}), 400

        #if that doesnt work check if its a reporting point
        except (IndexError, KeyError):
            try:
                vrp = data_vrps["items"][0]
                vrp_name = vrp["name"]
                vrp_country = vrp["country"]
                if vrp_name == data:
                    if vrp_country == 'GB':
                        return jsonify({"name": vrp["name"], "coordinates" : vrp["geometry"]["coordinates"]}), 200
                    else:
                        return jsonify({"error": "Point not found in UK database"}), 400
                    
            #if that doesnt work, throw an error as point hasnt been found
            except (IndexError, KeyError):
                return jsonify({"error": "Point not found in UK database"}), 400

#------------------------------------------------ROUTING-----------------------------------------------------

#-----------------------------------ADDING/REMOVING WAYPOINTS

@main.route("/add-waypoint", methods=["POST"])
def add_waypoint():
    waypoint = request.json.get("waypoint") #expecting a list [latitude, longitude]
    name = request.json.get("name") #expecting the name of the waypoint
    add_index = session["flight_data"]["flight"]["add_index"]#current index to be appended from
    #waypoints are always added before the destination airport (so one before the end)
    

    #allow the inital addition of departure and destination airports
    if add_index <= 0:
        session["flight_data"]["flight"]["route_names"].append(name)
        session["flight_data"]["flight"]["route"].append(waypoint)

    #for adding waypoints in between departure and destination
    else:
        session["flight_data"]["flight"]["route_names"].insert(add_index, name)
        session["flight_data"]["flight"]["route"].insert(add_index, waypoint)

    
    session["flight_data"]["flight"]["add_index"] += 1
    session.modified = True
    return jsonify(session["flight_data"]["flight"]["route"]), 200

@main.route("/remove-waypoint", methods=["POST"])
def remove_waypoint():
    remove_index = request.json.get("waypointIndex") #expecting the index of the waypoint to remove
    try:
        #remove the waypoint at the specified index
        session["flight_data"]["flight"]["route_names"].pop(remove_index)
        session["flight_data"]["flight"]["route"].pop(remove_index)
        session["flight_data"]["flight"]["add_index"] -= 1
        session.modified = True
        return jsonify(session["flight_data"]["flight"]["route"]), 200
    except IndexError:
        return jsonify({"error": "Invalid waypoint index"}), 400

#-----------------------------------------------AI------------------------------------------------------------
#-----------Getting selecet waypoints based on route (so i dont need to give all navaids and vrps to the AI)

def get_waypoints(coords):
    header = {
        "x-openaip-api-key": api_key_openaip
    }

    minx = min(coords[0][1], coords[1][1]) - 0.5367  #approx 20 NM corridor
    maxx = max(coords[0][1], coords[1][1]) + 0.5367
    miny = min(coords[0][0], coords[1][0])
    maxy = max(coords[0][0], coords[1][0])

    #"bbox" defines a rectangular area of interest for the query
    params_vrp = {
        "country": "GB",
        "fields" : "name,geometry.coordinates",
        "bbox" : f"{minx},{miny},{maxx},{maxy}"
    }

    params_navaid = {
        "country": "GB",
        "fields" : "identifier,geometry.coordinates",
        "bbox" : f"{minx},{miny},{maxx},{maxy}"
    }

    vrp = "https://api.core.openaip.net/api/reporting-points"
    navaid = "https://api.core.openaip.net/api/navaids"

    response_vrp = requests.get(vrp, headers=header, params=params_vrp)
    response_navaid = requests.get(navaid, headers=header, params=params_navaid)


    data_vrp = response_vrp.json()
    data_vrp["items"]

    data_navaid = response_navaid.json()
    data_navaid["items"]

    #print only the name and coordinates of each reporting point
    waypoints = []
    for item in data_vrp["items"]:
        waypoints.append(f"{item['name']}, {item['geometry']['coordinates']}")
    for item in data_navaid["items"]:
        waypoints.append(f"{item['identifier']}, {item['geometry']['coordinates']}")

    return waypoints


#------------------------Making a prompt
@main.route('/prompt', methods=["POST"])
def prompt():
    departure_coords = session["flight_data"]["flight"]["route"][0]
    destination_coords = session["flight_data"]["flight"]["route"][-1]

    type = request.json.get("type") #expecting 'Route', 'Brief' or 'Navlog'
    text = request.json.get("text") #the actual prompt text by user

    #making the OpenAI client and making the request
    try:
        client = OpenAI()
        response = client.responses.create(
            model="gpt-4.1",
            input=[
                {
                    "role" : 'system', "content" : 'You are a helpful flight planning assistant.',
                    "role" : 'user', "content" : (
                        fetchRole(type) + "\n\n" 
                        + text + "\n\n" 
                        + str(get_waypoints([departure_coords, destination_coords]))
                        )  
                }
            ]
        )
        response = response.output[0].content[0].text #parsing the response to just the text
        
        return jsonify({"response": response}), 200 #sends back the AI response
    
    except Exception as error:
        return jsonify({"error": str(error)}), 400
    
#----------------------------------------------WEATHER REPORTS-------------------------------------------------------
@main.route('/get-weather', methods=["POST"])
def get_weather():
    airport_code = request.json.get("code") #expecting ICAO code

    url_metar = f"https://api.checkwx.com/metar/{airport_code}/decoded"
    url_taf = f"https://api.checkwx.com/taf/{airport_code}/decoded"

    #making the requests to the API
    response_metar = requests.request("GET", url_metar, headers={'X-API-Key': api_key_wx})
    response_taf = requests.request("GET", url_taf, headers={'X-API-Key': api_key_wx})


    if response_metar.status_code == 200 and response_taf.status_code == 200:
        #parsing the responses to JSON
        data_metar = response_metar.json()

    try:
        metar = data_metar['data'][0]
        data_taf = response_taf.json()
        taf = data_taf['data'][0]
        return jsonify({"metar": metar, "taf": taf}), 200 #back to frontend
    
    except (IndexError, KeyError):
        #use the nearest station if the entred airport has no weather data
        url_metar = f"https://api.checkwx.com/metar/{airport_code}/nearest/decoded"
        url_taf = f"https://api.checkwx.com/taf/{airport_code}/nearest/decoded"

        response_metar = requests.request("GET", url_metar, headers={'X-API-Key': api_key_wx})
        response_taf = requests.request("GET", url_taf, headers={'X-API-Key': api_key_wx})

        if response_metar.status_code == 200 and response_taf.status_code == 200:
            #parsing the responses to JSON
            data_metar = response_metar.json()

        try:
            metar = data_metar['data'][0]
            data_taf = response_taf.json()
            taf = data_taf['data'][0]
            return jsonify({"metar": metar, "taf": taf}), 200 #back to frontend
        
        except (IndexError, KeyError):
            return jsonify({"error": "Unable to fetch weather data"}), 400

#--------------------------------------TIME & DISTANCE----------------------------

@main.route('/distance')
def getDistance():
    try:
        text = session["flight_data"]["flight"]["distance"]["output"]
    except KeyError:
        text = "0.0"

    return text, 200

#-------------------------------------------NAVLOG-------------------------------------

#------------Creating the navlog
@main.route('/makeNavlog')
def makeNavlog():
    route_names = session["flight_data"]["flight"]["route_names"]
    separate_distances = session["flight_data"]["flight"]["separate_distances"]
    separate_bearings = session["flight_data"]["flight"]["separate_bearings"]
    len_route = len(route_names)
    rows = session["flight_data"]["flight"]["NAVLOG"]["rows"]

    #alternate airport details
    alternate_track = session["flight_data"]["flight"]["alternate_track"]
    alternate_distance = session["flight_data"]["flight"]["alternate_distance"]
    alternateAirport_code = session["flight_data"]["flight"]["alternateAirport_code"]
    arrivalAirport_code = session["flight_data"]["flight"]["destinationAirport_code"]

    if alternateAirport_code != "" and session["flight_data"]["flight"]["NAVLOG"]["rows"] != []:
        #if a row already exists for the alternate airport, store it and remove it from the navlog temporarily
        if session["flight_data"]["flight"]["NAVLOG"]["rows"][-1]["FROM/TO"]["value"] == route_names[-1] + " - " + alternateAirport_code:
            existing_alt_row = session["flight_data"]["flight"]["NAVLOG"]["rows"][-1]
            session["flight_data"]["flight"]["NAVLOG"]["rows"].pop(-1)

        #if the last row contains a waypoint beggining with the arrival airfield, remove it as the alternate airport has changed
        #this prevents duplicate rows for the alternate airport, and only applies if above statement is false
        elif f"{arrivalAirport_code} - " in session["flight_data"]["flight"]["NAVLOG"]["rows"][-1]["FROM/TO"]["value"]:
            session["flight_data"]["flight"]["NAVLOG"]["rows"].pop(-1)
            existing_alt_row = None

        else:
            existing_alt_row = None

    elif session["flight_data"]["flight"]["NAVLOG"]["rows"] == []:
        existing_alt_row = None

    else:
        session["flight_data"]["flight"]["NAVLOG"]["rows"].pop(-1)
        existing_alt_row = None

    #only make the navlog if there are at least 3 points
    #(departure, destination and at least 1 waypoint)
    if len_route >= 3:
        for i in range(len_route - 1):
            #dealing with removed waypoints: if an a-b pair no longer exists, remove that row as its not present anymore
            try:
                if session["flight_data"]["flight"]["NAVLOG"]["rows"][i]["FROM/TO"]["value"] != route_names[i] + " - " + route_names[i+1]:
                    session["flight_data"]["flight"]["NAVLOG"]["rows"].pop(i)
            except IndexError: #if the index is out of range, a new row should be made anyway
                pass

            row = { #making each row as a dictionary.
                    #'calculated' indicates if its user input or calculated automatically
                "FROM/TO": {"value": route_names[i] + " - " + route_names[i+1], "calculated": True},
                "MSA": {"value":  rows[i]["MSA"]["value"] if i < len(rows) else "", "calculated": False},
                "ALT PLAN (FT)": {"value": rows[i]["ALT PLAN (FT)"]["value"] if i < len(rows) else "", "calculated": False},
                "TAS": {"value": rows[i]["TAS"]["value"] if i < len(rows) else "", "calculated": False},
                "TRACK (°T)": {"value": round(separate_bearings[i]), "calculated": True},
                "Wind DIR (°)": {"value": rows[i]["Wind DIR (°)"]["value"] if i < len(rows) else "", "calculated": False},
                "Wind SPD (KT)": {"value": rows[i]["Wind SPD (KT)"]["value"] if i < len(rows) else "", "calculated": False},
                "HDG (°T)": {"value": rows[i]["HDG (°T)"]["value"] if i < len(rows) else "", "calculated": True},
                "HDG (°M)": {"value": rows[i]["HDG (°M)"]["value"] if i < len(rows) else "", "calculated": True},
                "GS (KT)": {"value": rows[i]["GS (KT)"]["value"] if i < len(rows) else "", "calculated": True},
                "DIST (NM)": {"value": round(separate_distances[i], 1), "calculated": True},
                "TIME (Min)": {"value": rows[i]["TIME (Min)"]["value"] if i < len(rows) else "", "calculated": True}
            }
            #append the row to the navlog
            try:
                session["flight_data"]["flight"]["NAVLOG"]["rows"][i] = row
            except IndexError:
                session["flight_data"]["flight"]["NAVLOG"]["rows"].append(row)

        #adding the alternate airport row if an alternate airport has been specified
        if alternateAirport_code != "":
            #if a row already exists for the alternate airport, append it back
            if existing_alt_row:
                session["flight_data"]["flight"]["NAVLOG"]["rows"].append(existing_alt_row)

            else: #if not make a fresh row
                alt_row = {
                        "FROM/TO": {"value": route_names[-1] + " - " + alternateAirport_code, "calculated": True},
                        "MSA": {"value":  "", "calculated": False},
                        "ALT PLAN (FT)": {"value": "", "calculated": False},
                        "TAS": {"value": "", "calculated": False},
                        "TRACK (°T)": {"value": round(alternate_track), "calculated": True},
                        "Wind DIR (°)": {"value": "", "calculated": False},
                        "Wind SPD (KT)": {"value": "", "calculated": False},
                        "HDG (°T)": {"value": "", "calculated": True},
                        "HDG (°M)": {"value": "", "calculated": True},
                        "GS (KT)": {"value": "", "calculated": True},
                        "DIST (NM)": {"value": round(alternate_distance, 1), "calculated": True},
                        "TIME (Min)": {"value": "", "calculated": True}
                    }
                session["flight_data"]["flight"]["NAVLOG"]["rows"].append(alt_row)


    session.modified = True
    return {"headers": session["flight_data"]["flight"]["NAVLOG"]["headers"],
            "rows": session["flight_data"]["flight"]["NAVLOG"]["rows"]
        }, 200

#------------Clearing the navlog
@main.route('/clearNavlog')
def clearNavlog():
    #clear existing rows
    session["flight_data"]["flight"]["NAVLOG"]["rows"] = []
    
    route_names = session["flight_data"]["flight"]["route_names"]
    separate_distances = session["flight_data"]["flight"]["separate_distances"]
    separate_bearings = session["flight_data"]["flight"]["separate_bearings"]
    len_route = len(route_names)

    #alternate airport details
    alternate_track = session["flight_data"]["flight"]["alternate_track"]
    alternate_distance = session["flight_data"]["flight"]["alternate_distance"]
    alternateAirport_code = session["flight_data"]["flight"]["alternateAirport_code"]

    #only make the navlog if there are at least 3 points
    #(departure, destination and at least 1 waypoint)
    if len_route >= 3:
        for i in range(len_route - 1):
            row = { #making each row as a dictionary.
                    #'calculated' indicates if its user input or calculated automatically
                "FROM/TO": {"value": route_names[i] + " - " + route_names[i+1], "calculated": True},
                "MSA": {"value":  "", "calculated": False},
                "ALT PLAN (FT)": {"value": "", "calculated": False},
                "TAS": {"value": "", "calculated": False},
                "TRACK (°T)": {"value": round(separate_bearings[i]), "calculated": True},
                "Wind DIR (°)": {"value": "", "calculated": False},
                "Wind SPD (KT)": {"value": "", "calculated": False},
                "HDG (°T)": {"value": "", "calculated": True},
                "HDG (°M)": {"value": "", "calculated": True},
                "GS (KT)": {"value": "", "calculated": True},
                "DIST (NM)": {"value": round(separate_distances[i], 1), "calculated": True},
                "TIME (Min)": {"value": "", "calculated": True}
            }
            #append the row to the navlog
            session["flight_data"]["flight"]["NAVLOG"]["rows"].append(row)

        #adding the alternate airport row if an alternate airport has been specified
        if alternateAirport_code != "":
            #make and append the alternate airport row at the end
            alt_row = {
                    "FROM/TO": {"value": route_names[-1] + " - " + alternateAirport_code, "calculated": True},
                    "MSA": {"value":  "", "calculated": False},
                    "ALT PLAN (FT)": {"value": "", "calculated": False},
                    "TAS": {"value": "", "calculated": False},
                    "TRACK (°T)": {"value": round(alternate_track), "calculated": True},
                    "Wind DIR (°)": {"value": "", "calculated": False},
                    "Wind SPD (KT)": {"value": "", "calculated": False},
                    "HDG (°T)": {"value": "", "calculated": True},
                    "HDG (°M)": {"value": "", "calculated": True},
                    "GS (KT)": {"value": "", "calculated": True},
                    "DIST (NM)": {"value": round(alternate_distance, 1), "calculated": True},
                    "TIME (Min)": {"value": "", "calculated": True}
                }
            
            session["flight_data"]["flight"]["NAVLOG"]["rows"].append(alt_row)

    session.modified = True
    return {"headers": session["flight_data"]["flight"]["NAVLOG"]["headers"],
            "rows": session["flight_data"]["flight"]["NAVLOG"]["rows"]
        }, 200

#----------------------Updating data
@main.route('/update-cell', methods=["POST"])
def update_cell():
    row_index = request.json.get("row")
    column_name = request.json.get("column")
    new_value = request.json.get("value")

    navlog_rows = session["flight_data"]["flight"]["NAVLOG"]["rows"]

    #validate row index (shouldn't ever be triggered)
    if row_index < 0 or row_index >= len(navlog_rows):
        return jsonify({"error": "Invalid row index"}), 400

    #validate column name (also shouldn't ever be triggered)
    if column_name not in navlog_rows[row_index]:
        return jsonify({"error": "Invalid column name"}), 400
    
    #update the cell value
    navlog_rows[row_index][column_name]["value"] = new_value
    navlog_rows[row_index][column_name]["calculated"] = False #mark as user input

    #calculate fields for that row
    values = calculate_row(row_index)

    session.modified = True

    return values, 200


#----------------------Calculating calculated fields

#TRUE HEADING
def calc_HDG(tas, track, wind_dir, wind_spd):
    #convert inputs to radians
    track_rad = radians(track)
    wind_dir_rad = radians(wind_dir)
    wind_spd_ratio = wind_spd / tas

    #calculate wind correction angle
    wca = asin(wind_spd_ratio * sin(wind_dir_rad - track_rad))

    #calculate heading
    hdg_rad = track_rad + wca
    hdg = degrees(hdg_rad) % 360

    return round(hdg)

#GROUND SPEED
def calc_GS(tas, wind_dir, wind_spd, hdg):
    #convert inputs to radians
    wind_dir_rad = radians(wind_dir)
    hdg_rad = radians(hdg)

    #calculate ground speed
    gs = sqrt(tas**2 + wind_spd**2 - 2 * tas * wind_spd * cos(wind_dir_rad - hdg_rad))

    return round(gs)


def calculate_row(row_index):
    row = session["flight_data"]["flight"]["NAVLOG"]["rows"][row_index]
    variation = float(session["flight_data"]["flight"]["variation"])

    #getting necessary values
    tas = float(row["TAS"]["value"]) if row["TAS"]["value"] != "" else ""
    track = float(row["TRACK (°T)"]["value"])
    wind_dir = float(row["Wind DIR (°)"]["value"]) if row["Wind DIR (°)"]["value"] != "" else ""
    wind_spd = float(row["Wind SPD (KT)"]["value"]) if row["Wind SPD (KT)"]["value"] != "" else ""
    distance = float(row["DIST (NM)"]["value"])

    #only calculate if tas, wind_dir and wind_spd are provided
    if all(value != "" for value in [tas, wind_dir, wind_spd, track]):

        #heading
        try:
            row["HDG (°T)"]["value"] = calc_HDG(tas, track, wind_dir, wind_spd)
            row["HDG (°M)"]["value"] = (row["HDG (°T)"]["value"] + variation)
        except ValueError: #Return 'ERROR' for all fields if a calculation cannot be done
            return jsonify({"hdgT": "ERROR", "hdgM": "ERROR", "gs": "ERROR", "time": "ERROR"})

        #ground speed
        row["GS (KT)"]["value"] = calc_GS(tas, wind_dir, wind_spd, float(row["HDG (°T)"]["value"]))

    else:
        return jsonify ({ "data" : "none" })
    
    gs = row["GS (KT)"]["value"]
    if gs not in [0, ""]:
        row["TIME (Min)"]["value"] = round((distance / gs) * 60, 1) #time in minutes

    return jsonify({"hdgT": row["HDG (°T)"]["value"], "hdgM": row["HDG (°M)"]["value"], "gs": row["GS (KT)"]["value"], "time": row["TIME (Min)"]["value"]})

#----recalculating magnetic heading for all rows (for when variation is changed)
@main.route('/recalculate-magnetic-HDG')
def recalculate_variation():
    variation = float(session["flight_data"]["flight"]["variation"])
    rows = session["flight_data"]["flight"]["NAVLOG"]["rows"]

    for i in range(len(rows)):
        row = rows[i]
        #only recalculate if HDG (°T) is calculated
        if row["HDG (°T)"]["value"] != "":
            row["HDG (°M)"]["value"] = (row["HDG (°T)"]["value"] + variation)

    session.modified = True
    return jsonify({"status": "ok"}), 200

#--------calculating total flight time

@main.route('/calc_flight_time')
def calculate_flight_time():
    totalMins = 0
    rows = session["flight_data"]["flight"]["NAVLOG"]["rows"]
    calc = True

    for i in range(len(rows)):
        row = rows[i]
        #only calculate total time if all time values are filled
        if row["TIME (Min)"]["value"] == "":
            calc = False
            session['flight_data']['flight']['time'] = ''
            return jsonify ({"time" : 'none'})

    if calc:
        for i in range(len(rows)):
            row = rows[i]
            totalMins += float(row["TIME (Min)"]["value"])
        
        #convert to hours and minutes
        hours = totalMins // 60
        mins = totalMins % 60

        #update session
        totalTime = f'{round(hours)}hrs {round(mins)}mins'
        session['flight_data']['flight']['time'] = totalTime

        session.modified = True
        return jsonify({"time": totalTime}), 200

#-------------------------------------------FUEL-------------------------------------

#---------calculating totals
@main.route('/calculate-totals', methods=["POST"])
def calculate_totals():
    flight_data = session["flight_data"]["flight"]

    #---TOTAL FUEL---#
    #getting all fuel components
    taxi = flight_data["fuel_taxi"]["value"]
    trip = flight_data["fuel_trip"]["value"]
    contingency = flight_data["fuel_contingency"]["value"]
    alternate = flight_data["fuel_alternate"]["value"]
    finalReserve = flight_data["fuel_finalReserve"]["value"]
    additional = flight_data["fuel_additional"]["value"]
    extra = request.json.get("extra")

    #calculating total fuel
    total_fuel = sum([
        float(taxi),
        float(trip),
        float(contingency),
        float(alternate),
        float(finalReserve),
        float(additional),
        float(extra)
    ])
    

    #updating session
    flight_data["fuel_total"]["value"] = round(total_fuel, 1)

    #---TOTAL MASS---#
    specific_gravity = flight_data["specific_gravity"]
    if specific_gravity != "" and specific_gravity != 0:
        #if fuel is in litres, mass is fuel * SG (kg/litre)
        if session["flight_data"]["settings"]["units_fuel"] == "litre":
            fuel_mass = total_fuel * float(specific_gravity)

        #if fuel is in gallons, mass is fuel * SG * 8.345 (lbs/gallon)
        elif session["flight_data"]["settings"]["units_fuel"] == "US_liquid_gallon":
            fuel_mass = total_fuel * float(specific_gravity) * 8.345
        flight_data["fuel_mass"]["value"] = round(fuel_mass, 1)
    else:
        flight_data["fuel_mass"]["value"] = 0
 
    #---ENDURANCE--- to calculate how long the fuel will last based on burn rate
    fuel_burn = flight_data["fuel_burn"]["value"] #in units of fuel per hour
    if fuel_burn != "" and fuel_burn != 0:
        endurance_hours = total_fuel / float(fuel_burn)
        hours = int(endurance_hours)
        minutes = int((endurance_hours - hours) * 60)
        endurance = f"{hours}hrs {minutes}mins"
        flight_data["fuel_endurance"] = endurance

    update_unitsRUN() #reapply units after totals have been calculated
    session.modified = True

    return jsonify({"total_fuel": flight_data["fuel_total"]["output"],
                     "fuel_mass": flight_data["fuel_mass"]["output"],
                     "fuel_endurance": flight_data["fuel_endurance"]
                     }), 200