# coding=utf-8
import os

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class BomboraRecord(db.Model):
    """Bombora Record"""

    __tablename__ = "category_stats"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    industry = db.Column(db.TEXT, nullable=False)
    category = db.Column(db.TEXT, nullable=False)
    count = db.Column(db.INTEGER, nullable=False)
    average_score = db.Column(db.DECIMAL, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        """Statement when printed."""

        return "<Bombora JSON Record ID: %s>" % self.id


class DashboardBlocks(db.Model):
    """Facts about industries"""

    __tablename__ = "dashboard_blocks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    industry = db.Column(db.Text, nullable=False, unique=True)
    market_cap = db.Column(db.Integer, nullable=False)
    cap_raised = db.Column(db.Integer, nullable=False)
    opportunity = db.Column(db.Integer, nullable=False)
    cagr = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return "<Industry Facts: %s>" % self.id


def connect_to_db(app):
    """Connect the database to our Flask app."""

    DATABASE_URL = os.environ.get("DATABASE_URL",
                                  "postgresql://localhost/hackathon_db")
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    # allows working with the database directly

    from server import app

    connect_to_db(app)
    print "Connected to DB."
