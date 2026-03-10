from datetime import datetime
from .extentions import db

#flight datbase table
class Flight(db.Model):
    id = db.Column(db.Integer, primary_key=True) #column 1 (PRIMARY KEY), storing the session ID of the flight, which is used to link the flight data to a specific user session
    created_at = db.Column(db.DateTime, default=datetime.now) #column 2, storing the date and time the flight was created
    data = db.Column(db.Text) #column 3, storing the flight data as a stringified JSON object