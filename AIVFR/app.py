from flask import Blueprint, render_template, session, jsonify, request, Response, make_response, redirect, url_for
import json, os, copy, pint, requests
from dotenv import load_dotenv

main = Blueprint('app', __name__)

#------------------------------------------WEBTOOL NAVIGATION-------------------------------------
#main menu
@main.route('/') #this will be the first to load up
def index():
    if "flight_data" not in session: #initialise the session if not created already
        session["flight_data"] = data_template.copy()
        update_units()
    return render_template('menu.html', data=session["flight_data"], settings=session["flight_data"]["settings"])

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
    'litre' : "L",
    'gallon' : "gal",
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
                  "waypoint_addType" : "City/Town"
                  },
    "flight" : {
        "saved" : "False",
        "departureAirport_code" : "",
        "departureAirport_name" : "",
        "destinationAirport_code" : "",
        "destinationAirport_name" : "",
        "alternateAirport_code" : "",
        "alternateAirport_name" : "",
        "route" : [],
        "route_names" : [],
        "distance" : {"value" : 0, "class" : "distance"},
        "time" : "",
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
    session["flight_data"]["flight"][key] = value
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
    #resettting settings data for test (no data in flight to reset)
    session["flight_data"]["flight"] = data_template["flight"]
    session.modified = True
    
#shows any errors on the actual page
if __name__ == '__main__':
    main.run(debug=True)


#--------------------------------------------------API FUNCTIONS------------------------------------------------

#get all the relevant API keys from the .env file
load_dotenv()
api_key_openaip = os.getenv("OPENAIP_API_KEY")
api_key_maptiler = os.getenv("MAPTILER_API_KEY")
api_key_jawg = os.getenv("JAWG_API_KEY")
api_key_api_ninjas = os.getenv("API_NINJAS_API_KEY")

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

    if icao_code != code:
        return jsonify({"error": "ICAO code does not match"}), 400

    return jsonify({"name": name, "country": country}), 200

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
            if navaid_name == data:
                if navaid_country == 'GB':
                    return jsonify({"name": navaid["name"], "coordinates" : navaid["geometry"]["coordinates"]}), 200
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
    session["flight_data"]["flight"]["route_names"].append(name)
    session["flight_data"]["flight"]["route"].append(waypoint)
    session.modified = True
    return jsonify(session["flight_data"]["flight"]["route"]), 200

@main.route("/remove-waypoint", methods=["POST"])
def remove_waypoint():
    index = request.json.get("index") #expecting the index of the waypoint to remove
    session["flight_data"]["flight"]["route_names"].pop(index)
    try:
        session["flight_data"]["flight"]["route"].pop(index)
        session.modified = True
        return jsonify(session["flight_data"]["flight"]["route"]), 200
    except IndexError:
        return jsonify({"error": "Invalid waypoint index"}), 400