import os
import shutil
import subprocess
import json
import logging
from threading import Thread, Event
from time import sleep

from flask import session
from flask_socketio import emit
from watchdog.observers import Observer

from .. import socketio
from .utils.FASTQFileHandler import FASTQFileHandler
from .utils.tasks import int_download_database
from .utils import LinuxNotification

# Setup logger
logger = logging.getLogger('micas')

fileListenerThread = Thread()
thread_stop_event = Event()
REDIRECTION_EXECUTED = False

# HELPER FUNCTIONS

def run_fastq_watcher(app_loc, minion_loc):
    """Starts the FASTQ watcher."""
    logger.debug(f"Starting FASTQ watcher on {app_loc}")
    event_handler = FASTQFileHandler(app_loc)
    observer = Observer()
    observer.schedule(event_handler, path=minion_loc, recursive=False)
    observer.start()
    try:
        while True:
            sleep(1)
    except Exception as e:
        logger.error(f"Error in FASTQ watcher: {e}")
        observer.stop()
    observer.join()

def on_raw_message(message):
    """Handles raw messages for progress updates."""
    status = message['status']
    if status == "PROGRESS":
        percent_done = message['result']['percent-done']
        status_message = message['result']['message']
        emit('download_database_status', {'percent_done': percent_done, 'status_message': status_message})

        if percent_done == 100:
            minion = message['result']['minion']
            micas_location = message['result']['micas_location']
            logger.debug("Starting the MinION Listener")
            # start_fastq_file_listener(micas_location, minion)

    elif status == "SUCCESS":
        minion = message['result']['minion']
        micas_location = message['result']['micas_location']
        logger.debug(f"MinION Location: {minion}, MICAS Location: {micas_location}")


@socketio.on('connect', namespace="/analysis")
def analysis_connected():
    """Handles new connections to the analysis namespace."""
    logger.debug("Unused analysis connection made.")

@socketio.on('disconnect', namespace="/analysis")
def analysis_disconnected():
    """Handles disconnections from the analysis namespace."""
    micas_location = session.get('micas_location')
    if micas_location:
        subprocess.call(['rm', os.path.join(micas_location, 'analysis_busy')])
    logger.debug("Disconnected from analysis connection.")

@socketio.on('start_fastq_file_listener')
def start_fastq_file_listener(data):
    """Starts the FASTQ file listener."""
    micas_location = os.path.join(os.path.expanduser('~'), '.micas', data['projectId'])
    minion_location = data['minion_location']

    logger.debug("Request for FASTQ File Listener received.")
    global fileListenerThread

    if not fileListenerThread.is_alive():
        logger.debug("Starting the FASTQ file listener thread.")
        fileListenerThread = Thread(target=run_fastq_watcher, args=(micas_location, minion_location))
        fileListenerThread.daemon = True
        fileListenerThread.start()


@socketio.on('download_database', namespace="/")
def download_database(dbinfo):
    """Handles the database download process."""
    project_id = dbinfo["projectId"]
    device = dbinfo["device"]

    # Location for the application data directory
    micas_location = os.path.join(os.path.expanduser('~'), '.micas', project_id)

    # Create or recreate the micas_location directory
    if os.path.exists(micas_location):
        shutil.rmtree(micas_location)
        logger.debug(f"Recreating directory: {micas_location}")
    os.makedirs(micas_location, mode=0o777, exist_ok=True)

    queries = dbinfo["queries"]

    with open(os.path.join(micas_location, 'alertinfo.cfg'), 'w+') as alert_config_file:
        json.dump(dbinfo, alert_config_file)

    # # Emit notification to MinKNOW
    # alert_str = f"You can find the MICAS alert page for {project_id} at http://localhost:3000/analysis/{project_id}"
    # LinuxNotification.send_notification(device, alert_str, severity=1)

    # Create database directory
    logger.debug("Creating database directory.")
    os.makedirs(os.path.join(micas_location, 'database'), mode=0o777, exist_ok=True)

    # Create minimap2/runs directory
    logger.debug("Creating minimap2/runs directory.")
    os.makedirs(os.path.join(micas_location, 'minimap2/runs'), mode=0o777, exist_ok=True)


    minion = dbinfo['minion']
    project_id = dbinfo['projectId']
    device = dbinfo['device']

    micas_location_database = os.path.join(micas_location, 'database/')

    if len(queries) == 0:
        logger.debug("Debug: No database queries provided, skipping...")
    else:
        for i, query in enumerate(queries):
            query_file = open(query['file'], 'r')

            # Putting all the query sequences in one, input_sequences file.
            with open(micas_location_database + 'input_sequences.fa', 'a+') as input_sequences:
                input_sequences.write('\n')

            # get the fasta header and add it into the alertinfo.cfg file
            cmd = "grep '^>' " + query['file']
            fasta_header = os.popen(cmd).read().strip().split(">")[1]

            # update the alertinfo object to include fasta_header
            alertinfo_cfg_file = os.path.join(micas_location, 'alertinfo.cfg')
            logger.debug(f"Debug: Alert info file: {alertinfo_cfg_file}")
            with open(alertinfo_cfg_file, 'r') as alertinfo_fs:
                alertinfo_cfg_obj = json.load(alertinfo_fs)
                queries = alertinfo_cfg_obj["queries"]
                for _, q in enumerate(queries):
                    if q["file"] == query["file"]:
                        alertinfo_cfg_obj["queries"][i]["header"] = fasta_header

            alertinfo_cfg_obj['device'] = device
            # write the updated object into file
            json.dump(alertinfo_cfg_obj, open(alertinfo_cfg_file, 'w'))

            # copy the contents of query_file into input_sequences
            with open(query['file'], 'rb') as query_file, open(micas_location_database + 'input_sequences.fa',
                                                               'ab+') as input_sequences:
                shutil.copyfileobj(query_file, input_sequences)
            logger.debug(f"Debug: Merged {query['file']} sequence into input_sequences.fa file.")

    # Generate database index.
    import datetime
    now = datetime.datetime.now()

    logger.debug("Debug: Building the index.")
   
    dbname = \
        micas_location_database + str(now.year) + str(now.month) + str(now.day) + str(now.hour) + str(now.minute) + \
        str(now.second) + '.mmi'

    input_sequences_path = os.path.join(micas_location_database, 'input_sequences.fa')
    index_cmd = [
        'minimap2 -x map-ont -d ' + dbname + ' ' + input_sequences_path
    ]
    building_index_output = open(os.path.join(micas_location_database, 'building_index.txt'), 'w+')
    try:
        build_idx_cmd_output = subprocess.Popen(
            index_cmd,
            shell=True,
            stdout=building_index_output,
            stderr=building_index_output
        )
        build_idx_cmd_output.communicate()
        build_idx_cmd_output.wait()

    except (OSError, subprocess.CalledProcessError) as exception:
        logger.error(str(exception))
        return "ER1"

    logger.debug("Debug: Database has successfully been downloaded and built.")

    return {"minion": minion, "micas_location": micas_location, "device": device}

    # # Start the database download task
    # res = int_download_database.apply_async(args=[dbinfo, micas_location, queries])
    # res.get(on_message=on_raw_message, propagate=False)