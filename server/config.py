import os
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv(
    os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
)


class Config():
    DEBUG = True
    SECRET_KEY = os.getenv('SECRET_KEY')
    HOST = os.getenv('HOST', '127.0.0.1')
    PORT = int(os.getenv('PORT', 5007))