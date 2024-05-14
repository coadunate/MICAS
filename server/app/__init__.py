# Import standard libraries
import os
from dotenv import load_dotenv

# Import Flask components
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

# Initialize SocketIO
socketio = SocketIO()

def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Enable CORS for all domains
    CORS(app)

    # Register blueprints
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # Set up SocketIO with CORS allowed for all origins
    socketio.init_app(app, cors_allowed_origins='*')

    return app