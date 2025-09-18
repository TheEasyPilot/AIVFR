from flask import Flask
import os
from dotenv import load_dotenv

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SESSION_KEY")

    from .app import main as app_blueprint
    app.register_blueprint(app_blueprint)
    
    return app
