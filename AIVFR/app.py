from flask import Blueprint, render_template

main = Blueprint('app', __name__)

#main menu
@main.route('/') #this will be the first to load up
def index():
    return render_template('menu.html')

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
    return 'Route Tab'

#weather tab
@main.route('/weather')
def weatherTab():
    return 'Weather Tab'

#navigation log tab
@main.route('/navlog')
def navlogTab():
    return 'Navigation Log Tab'

#fuel tab
@main.route('/fuel')
def fuelTab():
    return 'Fuel'

#mass and balance tab
@main.route('/mass-and-balance')
def massAndBalanceTab():
    return 'Mass and balance tab'

#performance tab
@main.route('/performance')
def performanceTab():
    return 'performance tab'

#shows any errors on the actual page
if __name__ in '__main__':
    main.run(debug=True)