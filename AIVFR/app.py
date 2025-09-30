from flask import Blueprint, render_template, session, jsonify, request, Response, redirect, url_for
import json, os, copy

main = Blueprint('app', __name__)

#main menu
@main.route('/') #this will be the first to load up
def index():
    if "flight_data" not in session: #initialise the session if not created already
        session["flight_data"] = data_template.copy()
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
                  "units_airspeed" : "knots",
                  "units_altitude" : "feet",
                  "units_mass": "kilograms",
                  "units_fuel" : "litres",
                  "units_distance" : "nauticalMiles"},
    "flight" : {
        "saved" : "False",
        "departure_code" : "",
        "departure_name" : ""
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


#-- Starting a new flight --

#resets all flight data  but NOT settings
@main.route("/new-flight")
def NewFlightRun():
    #resettting settings data for test (no data in flight to reset)
    session["flight_data"]["flight"] = data_template["flight"]
    session.modified = True

    


#shows any errors on the actual page
if __name__ == '__main__':
    main.run(debug=True)
    