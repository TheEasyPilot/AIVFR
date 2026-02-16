from datetime import datetime
from .extentions import db

class Flight(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    data = db.Column(db.Text)