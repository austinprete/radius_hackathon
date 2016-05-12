import os

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class BomboraRecord(db.Model):
    """Bombora Record"""

    __tablename__ = "bombora_records"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime, nullable=False)
    json_data = db.Column()


    def __repr__ (self):
        """Statement when printed."""

        return "<Bombora JSON Record ID: %s>" % self.id


#########THIS CONNECTS TO DATABASE SO WE CAN WORK INTERACTIVELY IN CONSOLE

def connect_to_db(app):
    """Connect the database to our Flask app."""

    DATABASE_URL = os.environ.get("DATABASE_URL",
                              "postgresql://localhost/rad-insights")
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
# allows working with the database directly

    from server import app
    connect_to_db(app)
    print "Connected to DB."
