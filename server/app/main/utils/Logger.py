from flask_socketio import emit
from ... import socketio
from datetime import datetime
from enum import Enum, auto
import os, subprocess, sys, logging


class Level(Enum):
    INFO = 0
    DEBUG = 1
    WARNING = 2
    ERROR = 3
    CRITICAL = 4

# All the code in logger is not contained in class to emulate singleton functionality
class Logger():

    def __init__(self, loc="./logs/"):

        self.__LOG_LOC = loc
        self.__LOG_NAME = datetime.today().strftime('%Y-%m-%d')
        self.__FORMATTER = '%(asctime)-8s : %(name)-8s : %(levelname)-8s : %(message)s'
        self.__LOG_PATH = str(os.path.join(loc,self.__LOG_NAME+".log"))
        if not os.path.exists(os.path.dirname(self.__LOG_PATH)):
            try:
                os.makedirs(os.path.dirname(self.__LOG_PATH))
            except OSError as exc: # Guard against race condition
                if exc.errno != errno.EEXIST:
                    raise

        self.__LOGGER = logging.getLogger()
        print(type(self.__LOGGER))
        logging.basicConfig(filename=self.__LOG_PATH, level=logging.INFO, format=self.__FORMATTER)

        # For to dual to console and file logging
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        console.setFormatter(self.__FORMATTER)

        self.__LOGGER.addHandler(console)

    def log(self, msg, lvl=Level.INFO):
        if lvl is Level.INFO:
            self.__LOGGER.info(msg)
        elif lvl is Level.DEBUG:
            self.__LOGGER.debug(msg)
        elif lvl is Level.WARNING:
            self.__LOGGER.warning(msg)
        elif lvl is Level.ERROR:
            self.__LOGGER.error(msg)
        elif lvl is Level.CRITICAL:
            self.__LOGGER.critical(msg)
