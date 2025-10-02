from flask import Blueprint, render_template, session, jsonify, request, Response, redirect, url_for
import json, os, copy, pint

ureg = pint.UnitRegistry()
ureg.formatter.default_format = "~" #use the shortened version by defaut

main = Blueprint('app', __name__)

#-------------UNITS CHANGING-------------------

UNIT_MAP = {
    "distance": {"base": ureg.meter, "settings_key": "units_distance"},
    "altitude": {"base": ureg.meter, "settings_key": "units_altitude"},
    "airspeed": {"base": ureg.meter / ureg.second, "settings_key": "units_airspeed"},
    "mass": {"base": ureg.kilogram, "settings_key": "units_mass"},
    "fuel": {"base": ureg.litre, "settings_key": "units_fuel"},
}

def update_units(session):
    for key, item in session["flight_data"]["flight"].items():
        if isinstance(item, dict) and "class" in item:
            category = item["class"]

            if category in UNIT_MAP:
                base_unit = UNIT_MAP[category]["base"]
                settings_key = UNIT_MAP[category]["settings_key"]

                # Get canonical value (always stored in base)
                canonical = item["value"] * base_unit

                # Get display unit from settings
                display_unit = session["flight_data"]["settings"][settings_key]
                converted = canonical.to(getattr(ureg, display_unit))

                # Store both canonical and converted
                item["output"] = f"{converted.magnitude:.2f} {converted.units}"


@main.route('/units-update')
def update_unitsRUN():
    update_units(session)
    session.modified = True
    return 'updated', 200

#-----------WEBTOOL NAVIGATION----------------------
#main menu
@main.route('/') #this will be the first to load up
def index():
    if "flight_data" not in session: #initialise the session if not created already
        session["flight_data"] = data_template.copy()
        update_units(session)
    return render_template('menu.html', data=session["flight_data"], settings=session["flight_data"]["settings"])

#settings menu
@main.route('/settings')
def settingsMenu():
    return render_template('settings.html', settings=session["flight_data"]["settings"])

#dashboard
@main.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', settings=session["flight_data"]["settings"])

#Route tab
@main.route('/route')
def routeTab():
    return render_template('route.html', settings=session["flight_data"]["settings"], flight=session["flight_data"]["flight"])

#weather tab
@main.route('/weather')
def weatherTab():
    return render_template('weather.html', settings=session["flight_data"]["settings"])

#navigation log tab
@main.route('/navlog')
def navlogTab():
    return render_template('navlog.html', settings=session["flight_data"]["settings"])

#fuel tab
@main.route('/fuel')
def fuelTab():
    return render_template('fuel.html', settings=session["flight_data"]["settings"])

#mass and balance tab
@main.route('/mass-and-balance')
def massAndBalanceTab():
    return render_template('mass_and_balance.html', settings=session["flight_data"]["settings"])

#performance tab
@main.route('/performance')
def performanceTab():
    return render_template('performance.html', settings=session["flight_data"]["settings"])

#debug route that allows me to see the flight data at any time
@main.route('/debug')
def debug_session():
    return jsonify(session.get("flight_data", {}))

#----------FLIGHT DATA AND SESSION MANAGEMENT------------------------------------

#making the template to store flight data during a session
#also allows setting default values

data_template = {
    "settings" : {"theme": "light",
                  "units_airspeed" : "knot",
                  "units_altitude" : "feet",
                  "units_mass": "kilogram",
                  "units_fuel" : "litre",
                  "units_distance" : "nautical_mile"},
    "flight" : {
        "saved" : "False",
        "departureAirport_code" : "",
        "departureAiport_name" : "",
        "distance" : {"value" : 0, "class" : "distance"},
    }
}
#----------UPDATING/MODIFYING DATA------------------

#Updating Settings data
@main.route("/update-settings", methods=["POST"])
def update_settings():
    key = request.json.get("key")
    value = request.json.get("value")
    session["flight_data"]["settings"][key] = value
    session.modified = True # To check if change happened successfully
    return jsonify(session["flight_data"])

#Updating flight data
@main.route("/update-flight", methods=["POST"])
def update_flight():
    key = request.json.get("key")
    value = request.json.get("value")
    session["flight_data"]["flight"][key] = value
    session.modified = True # To check if change happened successfully
    return jsonify(session["flight_data"])

#---------------READING DATA------------------------

@main.route("/get-settings", methods=["GET"])
def get_settings():
    return jsonify(session["flight_data"]["settings"])

@main.route("/get-flight", methods=["GET"])
def get_flight():
    return jsonify(session["flight_data"]["flight"])
#---------------IMPORTING DATA-----------------------


#---------------EXPORTING DATA-----------------------


#------------STARTING A NEW FLIGHT------------------

#resets all flight data  but NOT settings
@main.route("/new-flight")
def NewFlightRun():
    #resettting settings data for test (no data in flight to reset)
    session["flight_data"]["flight"] = data_template["flight"]
    session.modified = True
    
#shows any errors on the actual page
if __name__ == '__main__':
    main.run(debug=True)
    
'''
Installation
You can install pint via pip:
pip install pint
Basic Setup
Before using pint, you need to create a Unit Registry, which maintains all your units and conversions:
import pint

# Initialize unit registry
ureg = pint.UnitRegistry()
Defining Quantities
Quantities are defined by multiplying a numeric value by a unit from the registry:
# Define distance and time
distance = 10 * ureg.mile
time = 2 * ureg.hour

print(distance)  # 10 mile
print(time)      # 2 hour
Converting Units
Use the .to() method to convert between different units:
# Distance conversion
distance_km = distance.to(ureg.kilometer)
print(f"10 miles is {distance_km:.2f} km")

# Speed calculation
speed = distance / time       # resulting unit: miles/hour
speed_in_kph = speed.to(ureg.kilometer / ureg.hour)
print(f"Speed: {speed_in_kph:.2f} km/h")

Volume Conversion Example
pint supports a wide variety of units including volume:
# Define gallons
volume_gallons = 5 * ureg.gallon

# Convert to liters
volume_liters = volume_gallons.to(ureg.liter)
print(f"5 gallons is {volume_liters:.2f} liters")

Combining Units (Derived Units)
You can perform calculations with multiple units and convert the result:
# Define speed in miles per hour
speed_mph = 60 * ureg.mile / ureg.hour
# Convert to knots (nautical miles per hour)
speed_knots = speed_mph.to(ureg.knot)
print(f"60 mph is {speed_knots:.2f} knots")

Arithmetic with Units
pint allows you to perform arithmetic while keeping track of units:
distance1 = 3 * ureg.km
distance2 = 2 * ureg.mile

total_distance = distance1 + distance2.to(ureg.km)
print(f"Total distance: {total_distance:.2f} km")

Custom Units
You can add your own units if needed:
ureg.define("smoot = 1.7018 meter")
height = 5 * ureg.smoot
print(f"Height in meters: {height.to(ureg.meter):.2f} m")
'''