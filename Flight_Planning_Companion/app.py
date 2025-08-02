from flask import Blueprint, render_template

main = Blueprint('app', __name__)

@main.route('/')
def index():
    return 'Main Menu'

@main.route('/settings')
def mainMenu():
    return 'Settings menu'