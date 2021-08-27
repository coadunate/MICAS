# The main entry point in the application

from app import create_app, socketio
from app.main.utils.Logger import *

app = create_app(debug=True)

if __name__ == '__main__':

    socketio.run(app)
