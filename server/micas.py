# The main entry point in the application

from app import create_app, socketio

# Logger Setup
import logging
import logging.config
from os import path
log_file_path = path.join(path.dirname(path.abspath(__file__)), 'logging.ini')
logging.config.fileConfig(log_file_path)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = create_app(debug=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5007)
