from flask import Blueprint, render_template, session, jsonify, request, Response, redirect, url_for
import json, os, copy, pint

main = Blueprint('app', __name__)

#----------------------WEBTOOL NAVIGATION-------------------------
#main menu
@main.route('/') #this will be the first to load up
def index():
    if "flight_data" not in session: #initialise the session if not created already
        session["flight_data"] = data_template.copy()
        initialise_units(session)
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

#-----------------UNITS CHANGING------------------------

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

def initialise_units(session):
    for key, item in session["flight_data"]["flight"].items():
        if isinstance(item, dict) and "class" in item:
             #each unit gets a category to differentiate between unit groups
            category = item["class"]

            if category in UNIT_MAP:
                base_unit = UNIT_MAP[category]["base"]
                settings_key = UNIT_MAP[category]["settings_key"]

                #update the base unit to the current unit
                global display_unit
                display_unit = session["flight_data"]["settings"][settings_key]
                base_unit = ureg[display_unit]

def update_units():
    for key, item in session["flight_data"]["flight"].items():
        if isinstance(item, dict) and "class" in item:
             #each unit gets a category to differentiate between unit groups
            category = item["class"]

            if category in UNIT_MAP:
                #get the base value, which is where the conversion starts from
                base_unit = UNIT_MAP[category]["base"]
                canonical = item["value"] * base_unit

                #get the unit to be converted to (and to be displayed) from settings
                global display_unit
                converted = canonical.to(getattr(ureg, display_unit))

                #format the output so it has the number plus its units
                unit_name = str(converted.units)
                unit_name = CUSTOM_UNITS.get(unit_name, unit_name)
                item["output"] = f"{converted.magnitude:.1f} {unit_name}"

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
    update_units()
    initialise_units(session) #re-initialise to ensure the base unit matches the new unit
    session.modified = True
    return 'updated', 200

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
        "saved" : "True", #TEST
        "departureAirport_code" : "",
        "departureAirport_name" : "",
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