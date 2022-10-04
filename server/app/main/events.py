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

# for run_fasq_watcher
from watchdog.observers import Observer

import json

# for Logger
import logging

logger = logging.getLogger('micas')

fileListenerThread = Thread()
thread_stop_event = Event()

REDIRECTION_EXECUTED = False


# HELPER FUNCTIONS

def run_fastq_watcher(app_loc, minion_loc):
    logger.debug(f"Debug: Starting fastq watcher on {app_loc}")
    event_handler = FASTQFileHandler(app_loc)
    observer = Observer()
    observer.schedule(event_handler, path=minion_loc, recursive=False)
    observer.start()
    try:
        while True:
            sleep(1)
    except:
        observer.stop()


@socketio.on('connect', namespace="/analysis")
def analysis_connected():
    logger.debug("Debug: Unused analysis connection made.")


@socketio.on('disconnect', namespace="/analysis")
def analysis_disconnected():
    # delete the analysis_busy file
    subprocess.call(['rm', session.get('micas_location') + 'analysis_busy'])
    logger.debug("Debug: Disconnect from analysis connection.")


@socketio.on('start_fastq_file_listener')
def start_fastq_file_listener(data):
    micas_location = os.path.join(os.path.expanduser('~'), '.micas/' + data['projectId'] + '/')
    minion_location = data['minion_location']
    # need visibility of the global thread object
    logger.debug("Debug: Request for FASTQ File Listener recieved.")
    global fileListenerThread

    if not fileListenerThread.isAlive():
        logger.debug("Debug: Starting the FASTQ file listener thread.")
        fileListenerThread = Thread(target=run_fastq_watcher(micas_location, minion_location))
        fileListenerThread.daemon = True
        fileListenerThread.start()

def on_raw_message(message):
    status = message['status']
    if status == "PROGRESS":

        percent_done = message['result']['percent-done']
        status_message = message['result']['message']
        project_id = message['result']['project_id']

        emit(
            'download_database_status',
            {'percent_done': percent_done, 'status_message': status_message}
        )

        if percent_done == 100:
            minion = message['result']['minion']
            micas_location = message['result']['micas_location']

            logger.debug("Debug: Starting the MinION Listener")
            # start_fastq_file_listener(micas_location, minion)

    if status == "SUCCESS":
        minion = message['result']['minion']
        micas_location = message['result']['micas_location']
        logger.debug(f"Debug: MinION Location: {minion}, MICAS Location: {micas_location}")


@socketio.on('download_database', namespace="/")
def download_database(dbinfo):

    project_id = dbinfo["projectId"]

    # Location for the application data directory
    micas_location = os.path.join(os.path.expanduser('~'), '.micas/' + project_id + '/') #Add to CONFIG

    # create micas_location directory if it doesn't exist
    if not os.path.exists(micas_location):
        print("Creating directory: " + micas_location)
        os.makedirs(micas_location)
    else:
       # delete the directory and recreate it
        shutil.rmtree(micas_location)
        print("I AM CREATING " + micas_location + " DIRECTORY FROM download_database")
        os.makedirs(micas_location)

    queries = dbinfo["queries"]

    # Create a file to indicate that the download is in progress
    download_in_progress = open(micas_location + '.download_in_progress', 'a')

    with open(micas_location + 'alertinfo.cfg', 'w+') as alert_config_file:
        alert_config_file.write(json.dumps(dbinfo))

    # Create database directory.
    logger.debug("Debug: Creating database directory.")
    os.umask(0)
    os.makedirs(os.path.join(micas_location, 'database'), mode=0o777, exist_ok=True)
   

    # Create minimap2/runs directory
    logger.debug("Debug: Creating minimap2/runs directory.")
    os.umask(0)
    os.makedirs(micas_location + 'minimap2/runs', mode=0o777, exist_ok=True)

    res = int_download_database.apply_async(args=[dbinfo, micas_location, queries])
    res.get(on_message=on_raw_message, propagate=False)


# LOGGER HOOKS
@socketio.on('log')
def log(msg, lvl):
    if str(lvl).upper() == "INFO":
        logger.info(msg)
    elif str(lvl).upper() == "DEBUG":
        logger.debug(msg)
    elif str(lvl).upper() == "WARNING":
        logger.warning(msg)
    elif str(lvl).upper() == "ERROR":
        logger.error(msg)
    elif str(lvl).upper() == "CRITICAL":
        logger.critical(msg)
