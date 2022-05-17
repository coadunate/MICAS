from celery import Celery
import subprocess, os, shutil, random
from celery.exceptions import SoftTimeLimitExceeded
from flask_socketio import emit
import json, sys

import logging

logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
logger = logging.getLogger()

celery = Celery('tasks', broker='redis://localhost', backend='redis')

@celery.task(bind=True, name='app.main.tasks.int_download_database')
def int_download_database(self, db_data, queries):
    app_location = db_data['app_location']
    minion = db_data['minion']
    project_id = db_data['projectId']

    # add trailing slashes if they don't exist
    app_location = app_location if app_location.endswith('/') else app_location + '/'

    # Create variables for database.
    app_location_database = app_location + 'database/'

    if len(queries) == 0:
        logger.debug("DOWNLOAD DATABASE: No queries provided, skipping.")
    else:
        for i, query in enumerate(queries):
            query_file = open(query['file'], 'r')

            # Putting all the query sequences in one, input_sequences file.
            with open(app_location_database + 'input_sequences.fa', 'a+') as input_sequences:
                input_sequences.write('\n')

            # get the fasta header and add it into the alertinfo.cfg file
            cmd = "grep '^>' " + query['file']
            fasta_header = os.popen('grep "^>" ' + cmd).read().strip().split(">")[1]

            # update the alertinfo object to include fasta_header
            alertinfo_cfg_file = os.path.join(app_location, 'alertinfo.cfg')
            logger.debug("Alert info file: " + alertinfo_cfg_file)
            logger.info("Alert info file: " + alertinfo_cfg_file)
            with open(alertinfo_cfg_file, 'r') as alertinfo_fs:
                alertinfo_cfg_obj = json.load(alertinfo_fs)
                queries = alertinfo_cfg_obj["queries"]
                for _, q in enumerate(queries):
                    if q["file"] == query["file"]:
                        alertinfo_cfg_obj["queries"][i]["header"] = fasta_header

                logger.info(alertinfo_cfg_obj)

            # write the updated object into file
            json.dump(alertinfo_cfg_obj, open(alertinfo_cfg_file, 'w'))

            # copy the contents of query_file into input_sequences
            with open(query['file'], 'rb') as query_file, open(app_location_database + 'input_sequences.fa',
                                                               'ab+') as input_sequences:
                shutil.copyfileobj(query_file, input_sequences)
            logger.debug("DOWNLOAD_DATABASE: Merged " + query['file'] + " sequence into input_sequences.fa file.")

            self.update_state(
                state="PROGRESS",
                meta={
                    'percent-done': 50,
                    'message'     : "Merged " + query['file'] + " sequence into input_sequences.fa file.",
                    'project_id'  : project_id
                }
            )

    # Generate database index.
    import datetime
    now = datetime.datetime.now()

    logger.debug("DOWNLOAD_DATABASE: Building the index.")
    self.update_state(state="PROGRESS",
                      meta={'percent-done': 98, 'message': "Building the index.", 'project_id': project_id})

    dbname = \
        app_location_database + str(now.year) + str(now.month) + str(now.day) + str(now.hour) + str(now.minute) + \
        str(now.second) + '.mmi'

    input_sequences_path = os.path.join(app_location_database, 'input_sequences.fa')
    index_cmd = [
        'minimap2 -x map-ont -d ' + dbname + ' ' + input_sequences_path
    ]

    building_index_output = open(app_location_database + 'building_index.txt', 'w+')
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

    logger.debug("DOWNLOAD_DATABASE: Database has successfully been downloaded and built.")
    self.update_state(state="PROGRESS",
                      meta={
                          'percent-done': 100,
                          'message'     : "Database has successfully been downloaded and built.",
                          'app_location': app_location,
                          'minion'      : minion,
                          'project_id'  : project_id
                      })

    return {"minion": minion, "app_location": app_location}
