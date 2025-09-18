from flask import Blueprint, render_template, session, jsonify, request, Response
import json, os, copy
from flask_session import Session

main = Blueprint('app', __name__)

#main menu
@main.route('/') #this will be the first to load up
def index():
    if "data" not in session:
        session["data"] = data_template.copy()
    return render_template('menu.html', data=session["data"])

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
    return jsonify(session.get("data", {}))

#----------flight data and session management--------------

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


@main.route("/update", methods=["POST"])
def update_session():
    # update a field inside the session data
    key = request.json.get("key")
    value = request.json.get("value")

    if "data" not in session:
        session["data"] = data_template.copy()

    # example: update a nested field
    session["data"]["settings"][key] = value
    session.modified = True  # ensure session cookie is updated

    return jsonify(session["data"])

@main.route("/export")
def export_session():
    # let user download their current state
    return jsonify(session.get("data", {}))

#shows any errors on the actual page
if __name__ in '__main__':
    main.run(debug=True)