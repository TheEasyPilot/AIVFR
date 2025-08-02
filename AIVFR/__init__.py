from flask import Flask

def create_app():
    app = Flask(__name__)

    from .app import main as app_blueprint
    app.register_blueprint(app_blueprint)
    

    return app