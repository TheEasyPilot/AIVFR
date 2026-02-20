from flask import Flask
import os
from dotenv import load_dotenv
from .extentions import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SESSION_KEY")
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///flights.db"

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    from .app import main as app_blueprint
    app.register_blueprint(app_blueprint)

    with app.app_context():
        db.create_all()

    return app
