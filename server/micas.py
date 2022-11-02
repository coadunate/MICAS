# The main entry point in the application

from app import create_app, socketio

# Logger Setup
import logging
import logging.config
from os import path
logging.config.fileConfig("./server/logging.ini")
log = logging.getLogger('micas')

app = create_app(debug=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5007)
