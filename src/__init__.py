from flask import Flask
import os
from dotenv import load_dotenv
from .extentions import db

load_dotenv()

#factory function to create and configure the Flask application (defined by SQLAlchemy)
def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SESSION_KEY")
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///flights.db"

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    #registering the main blueprint for the application
    from .app import main as app_blueprint
    app.register_blueprint(app_blueprint)

    #creating the database tables within the application context
    #this ensures they are set up before handling any requests
    with app.app_context():
        db.create_all()

    return app
