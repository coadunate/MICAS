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
    bacteria = db_data['bacteria']
    archaea = db_data['archaea']
    virus = db_data['virus']
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
                logger.debug(alertinfo_cfg_obj)
                logger.info(alertinfo_cfg_obj)
                queries = alertinfo_cfg_obj["queries"]
                for _, q in enumerate(queries):
                    if q["file"] == query["file"]:
                        alertinfo_cfg_obj["queries"][i]["header"] = fasta_header

                logger.debug(alertinfo_cfg_obj)
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

    # If user has requested to download NCBI database
    if bacteria or archaea or virus:

        # Construct db_string first
        db_list = []
        if bacteria:
            db_list.append('bacteria')
        if archaea:
            db_list.append('archaea')
        if virus:
            db_list.append('viral')

        db_string = ",".join([str(x) for x in db_list])

        logger.debug("DOWNLOAD_DATABASE: Downloading " + db_string + " database(s) from NCBI")
        self.update_state(
            state="PROGRESS",
            meta={
                'percent-done': 55,
                'message'     : "Downloading " + db_string + " database(s) from NCBI",
                'project_id'  : project_id
            }
        )
        cmd = ['centrifuge-download -o ' + app_location_database + 'library -m -d ' + db_string + ' refseq']
        logger.debug(f"CMD:\n {cmd}")
        outfile = open(app_location_database + 'seqid2taxid.map', 'a+')
        err_file = open(app_location_database + 'download_err.txt', 'w+')
        try:
            # Download the database.
            download_db_cmd_output = subprocess.Popen(
                cmd,
                shell=True,
                stdout=outfile,
                stderr=err_file
            )
            download_db_cmd_output.communicate()
            download_db_cmd_output.wait()

        except (OSError, subprocess.CalledProcessError) as exception:
            logger.error(str(exception))
            return "ER1"

        else:
            logger.debug("DOWNLOAD_DATABASE: Successfully downloaded " + db_string + " database(s) from NCBI")
            self.update_state(
                state="PROGRESS",
                meta={
                    'percent-done': 90,
                    'message'     : "Successfully downloaded " + db_string + "database(s) from NCBI",
                    'project_id'  : project_id
                }
            )

            import glob

            # Putting all the query sequences in one, input_sequences file.
            logger.debug("DOWNLOAD_DATABASE: Concatenating all the sequence files.")
            self.update_state(state="PROGRESS",
                              meta={'percent-done': 95, 'message': "Concatenating all the sequence files.",
                                    'project_id'  : project_id}
                              )
            with open(app_location_database + 'input_sequences.fa', 'wb') as outfile:
                for filename in glob.glob(app_location_database + 'library/*/*.fna'):
                    with open(filename, 'rb') as readfile:
                        shutil.copyfileobj(readfile, outfile)

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
