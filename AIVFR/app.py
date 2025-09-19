from flask import Blueprint, render_template, session, jsonify, request, Response
import json, os, copy

main = Blueprint('app', __name__)

#main menu
@main.route('/') #this will be the first to load up
def index():
    if "flight_data" not in session: #initialise the session if not created already
        session["flight_data"] = data_template.copy()
    return render_template('menu.html', data=session["flight_data"])

#settings menu
@main.route('/settings')
def settingsMenu():
    return render_template('settings.html')

#dashboard
@main.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

#Route tab
@main.route('/route')
def routeTab():
    return render_template('route.html')

#weather tab
@main.route('/weather')
def weatherTab():
    return render_template('weather.html')

#navigation log tab
@main.route('/navlog')
def navlogTab():
    return render_template('navlog.html')

#fuel tab
@main.route('/fuel')
def fuelTab():
    return render_template('fuel.html')

#mass and balance tab
@main.route('/mass-and-balance')
def massAndBalanceTab():
    return render_template('mass_and_balance.html')

#performance tab
@main.route('/performance')
def performanceTab():
    return render_template('performance.html')

#debug route that allows me to see the flight data at any time
@main.route('/debug')
def debug_session():
    return jsonify(session.get("flight_data", {}))

#----------flight data and session management-----------------------------

#making the template to store flight data during a session
#also allows setting default values

data_template = {
    "settings" : {"theme": "light",
                  "units_airspeed" : "knots",
                  "units_altitude" : "feet",
                  "units_mass": "kilograms",
                  "units_fuel" : "litres",
                  "units_distance" : "nautical_miles"},
    "flight" : {
        "departure" : "",
        "departure_name" : ""
    }
}

#Updating/modifying data in the session
@main.route("/update-settings", methods=["POST"])
def update_session():
    key = request.json.get("key")
    value = request.json.get("value")
    session["flight_data"]["settings"][key] = value
    session.modified = True
    return jsonify(session["flight_data"])

#shows any errors on the actual page
if __name__ in '__main__':
    main.run(debug=True)