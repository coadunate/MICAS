from flask import url_for, session
from flask_socketio import emit, send
from .. import socketio

from threading import Thread, Event

# for download_database
import os, shutil, subprocess
from time import sleep

# for run_fastq_watcher
from .utils.FASTQFileHandler import FASTQFileHandler
from .utils.tasks import int_download_database

from .utils.parse import krakenParse

# for run_fasq_watcher
from watchdog.observers import Observer

import json

# for Logger
from .utils.Logger import Logger
from micas import logger

fileListenerThread = Thread()
thread_stop_event = Event()

REDIRECTION_EXECUTED = False


############### HELPER FUNCTIONS ###############

def run_fastq_watcher(app_loc,minion_loc):
    logger.log("RUNNING FASTQ WATCHER", "INFO")
    event_handler = FASTQFileHandler(app_loc)
    observer = Observer()
    observer.schedule(event_handler, path=minion_loc, recursive=False)
    observer.start()
    sleep(1)

###############------------------###############

@socketio.on('connect',namespace="/analysis")
def analysis_connected():
    logger.log("CONNECTED TO ANALYSIS", "INFO")

@socketio.on('disconnect',namespace="/analysis")
def analysis_disconnected():
    # delete the analysis_busy file
    subprocess.call(['rm',session.get('app_location') + 'analysis_busy'])
    logger.log("DISCONNECTED FROM ANALYSIS", "INFO")

def start_fastq_file_listener(app_location,minion_location):
    # need visibility of the global thread object
    logger.log("Starting FASTQ File Listener", "INFO")
    global fileListenerThread

    if not fileListenerThread.isAlive():
        logger.log("Starting the FASTQ file listener thread", "INFO")
        fileListenerThread = Thread(target=run_fastq_watcher(app_location,minion_location))
        fileListenerThread.daemon = True
        fileListenerThread.start()

@socketio.on('update_sankey_filter', namespace="/analysis")
def update_sankey_filter(app_location, value):
    logger.log("update_sankey_filter", "INFO")

    app_location = app_location if app_location.endswith('/') else app_location + '/'
    analysis_filter_file_path = app_location + 'centrifuge/sankey.filter'
    with open(analysis_filter_file_path,'w') as analysis_filter_file:
        analysis_filter_file.write(str(value))


    with open(app_location + 'centrifuge/sankey.data','w') as sankey_data_file:
        sankey_data_file.write(str(krakenParse(app_location + 'centrifuge/sankey.filter', app_location + 'centrifuge/final.out.kraken')) + "\n")

def on_raw_message(message):
    status = message['status']
    if(status == "PROGRESS"):
        percent_done = message['result']['percent-done']
        status_message = message['result']['message']

        socketReturn = emit('download_database_status',{'percent_done': percent_done, 'status_message': status_message}, namespace="/analysis")
        logger.log(str(percent_done) + "% [" + status_message + "]", "INFO")
    if status == "SUCCESS":
        minion = message['result']['minion']
        app_location = message['result']['app_location']
        logger.log("Database download successful and now the locs are MinION: " + minion + " MICAS: " + app_location, "INFO")
        start_fastq_file_listener(app_location, minion)




@socketio.on('download_database', namespace="/")
def download_database(dbinfo):

    # Location for the application data directory
    app_location = dbinfo['app_location'] if dbinfo['app_location'].endswith('/') else dbinfo['app_location'] + '/'

    queries = dbinfo["queries"]

    # Firstly, we need to remove any existing files that might exist inside
    # our app data folder, as it is supposed to be empty to begin with.
    for file in os.listdir(app_location):
        file_path = os.path.join(app_location,file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
                logger.log("DOWNLOAD_DATABASE: Deleting " + file + " file.", "INFO")
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
                logger.log("DOWNLOAD_DATABASE: Deleting " + file + " directory.", "INFO")
        except Exception as e:
            logger.log(e, "ERROR")

    # Create an file to indicate that the download is in progress
    download_in_progress = open(app_location + '.download_in_progress','a')

    with open(app_location + 'alertinfo.cfg','w+') as alert_config_file:
        alert_config_file.write(json.dumps(dbinfo))

    # Create database directory.
    logger.log("DOWNLOAD_DATABADE: Creating database directory.", "INFO")
    os.makedirs(app_location + 'database')

    # Create centrifuge/runs directory
    logger.log("DOWNLOAD_DATABASE: Creating centrifuge/runs directory.", "INFO")
    os.makedirs(app_location + 'centrifuge/runs')

    res = int_download_database.apply_async(args=(dbinfo,queries))
    logger.log(res, "DEBUG")
    logger.log(res.get(on_message=on_raw_message, propagate=False), "DEBUG")

###############- Logger Hooks -###############

    @socketio.on('log')
    def log(msg, lvl):
        logger.__LOGGER.log(msg, Level(lvl))




