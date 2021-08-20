from flask_socketio import emit
from ... import socketio
from datetime import datetime

import os, subprocess, sys, logging

# All the code in logger is not contained in class to emulate singleton functionality
class Logger():

    def __init__(self, loc="./logs/"):

        self.__LOG_LOC = loc
        self.__LOG_NAME = str(f"{datetime.now().hour}_{datetime.now().hour}")
        self.__FORMATTER = '%(asctime)s %(name)-12s: %(levelname)-8s %(message)s'
        self.__LOG_PATH = str(os.path.join(loc,self.__LOG_NAME+".log"))
        if not os.path.exists(os.path.dirname(self.__LOG_PATH)):
            try:
                os.makedirs(os.path.dirname(self.__LOG_PATH))
            except OSError as exc: # Guard against race condition
                if exc.errno != errno.EEXIST:
                    raise

        self.__LOGGER = logging.getLogger('TEST')
        print(type(self.__LOGGER))
        logging.basicConfig(filename=self.__LOG_PATH, level=logging.INFO, format=self.__FORMATTER)

        # For to dual to console and file logging
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        console.setFormatter(self.__FORMATTER)

        self.__LOGGER.addHandler(console)

    def log(self, msg, lvl=1):
        self.__LOGGER.info(msg)