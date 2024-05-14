# micas.py - The main entry point for the application

# Standard library imports
import os
import logging
import logging.config
from os import path
from config import Config

# Third-party imports
from dotenv import load_dotenv
from app import create_app, socketio

# Configure logging
def configure_logging():
    """Configure logging using settings from a configuration file."""
    logging.config.fileConfig("./server/logging.ini")

# Initialize the Flask app with SocketIO
def initialize_app():
    """Create and configure the Flask application with SocketIO support"""
    app = create_app()
    return app

# Main function to start the Flask server
def start_server(app):
    """Start the Flask server using SocketIO"""
    socketio.run(app, host=Config.HOST, port=Config.PORT)

if __name__ == '__main__':
    configure_logging()
    app = initialize_app()
    start_server(app)