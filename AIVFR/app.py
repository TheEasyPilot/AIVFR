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

#shows any errors on the actual page
if __name__ in '__main__':
    main.run(debug=True)