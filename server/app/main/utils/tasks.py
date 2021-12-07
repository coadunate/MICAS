from celery import Celery
import subprocess, os, shutil, random
from celery.exceptions import SoftTimeLimitExceeded
from flask_socketio import emit
import json

from Bio import Entrez
import logging

logger = logging.getLogger()

celery = Celery('tasks', broker='redis://localhost', backend='redis')

Entrez.email = 'tayab.soomro@usask.ca'


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

    # Download taxonomy
    print("DOWNLOAD DATABASE: Downloading taxonomy files")
    self.update_state(
        state="PROGRESS",
        meta={'percent-done': 10, 'message': 'Downloading taxonomy files', 'project_id': project_id}
    )

    tax_cmd = ['centrifuge-download -o ' + app_location_database + 'taxonomy taxonomy']
    try:
        tax_cmd_output = subprocess.Popen(tax_cmd, shell=True, stderr=subprocess.STDOUT)
        tax_cmd_output.communicate()
        tax_cmd_output.wait()
    except (OSError, subprocess.CalledProcessError) as exception:
        print(str(exception))
        self.update_state(
            state="FAILURE",
            meta={'percent-done': 10, 'message': 'ERROR: ' + str(exception), 'project_id': project_id}
        )
        return "ER0"
    else:
        print("DOWNLOAD DATABASE: Successfully downloaded taxonomy files")

    # Create seqid2taxid.map file

    seqid2taxid_file = open(app_location_database + 'seqid2taxid.map', 'a+')
    seqid2taxid_file.write('\n')

    print("DOWNLOAD DATABASE: Created seqid2taxid.map file")
    self.update_state(
        state="PROGRESS",
        meta={'percent-done': 20, 'message': 'Creating seqid2taxid.map file', 'project_id': project_id}
    )

    if len(queries) == 0:
        print("DOWNLOAD DATABASE: No queries provided, skipping.")
    else:
        print("DOWNLOAD DATABASE: Entering queries into taxonomy files.")
        self.update_state(
            state="PROGRESS",
            meta={'percent-done': 30, 'message': 'Entering queries into taxonomy files.', 'project_id': project_id}
        )
        for i, query in enumerate(queries):
            query_file = open(query['file'], 'r')

            # Generate non-existant tax_id from the given parent tax_id
            proposed_tax_id = ''
            already_seen_tax_id = []
            while True:
                randNum = random.randint(100, 999)
                proposed_tax_id = query['parent'] + str(randNum)
                record = Entrez.read(Entrez.efetch(db='Taxonomy', id=proposed_tax_id, retmode='xml'))

                if len(record) == 0 and proposed_tax_id not in already_seen_tax_id:
                    already_seen_tax_id.append(proposed_tax_id)
                    break

            NCBI_id = "sequence_" + str(proposed_tax_id)  # Sequence ID for seqid2taxid.map file

            data = None
            with open(app_location + 'alertinfo.cfg') as alert_fs:
                data = json.loads(alert_fs.read())
                data["queries"][i]["tax_id"] = proposed_tax_id

            with open(app_location + 'alertinfo.cfg', 'w') as write_file:
                write_file.write(json.dumps(data))

            # Add an entry in seqid2taxid with NCBI's id and the tax_id
            print("DOWNLOAD_DATABASE: Added " + query['name'] + " entry in seqid2taxid.map file")
            self.update_state(
                state="PROGRESS",
                meta={
                    'percent-done': 35,
                    'message': "Added " + query['name'] + " entry in seqid2taxid.map file",
                    'project_id': project_id
                }
            )
            seqid2taxid_file.write(str(NCBI_id) + '\t' + str(proposed_tax_id) + '\n')

            # Add an entry in nodes.dmp with parent tax_id, tax_id and rank (species)
            entry = str(proposed_tax_id) + '\t|\t' + str(query['parent']) + '\t|\t' + 'species\t|\n'
            with open(app_location_database + 'taxonomy/nodes.dmp', 'a+') as nodes_dmp:
                nodes_dmp.write(entry)
            print("DOWNLOAD_DATABASE: Added " + query['name'] + " entry in nodes.map file")
            self.update_state(
                state="PROGRESS",
                meta={
                    'percent-done': 40,
                    'message': "Added " + query['name'] + " entry in nodes.dmp file",
                    'project_id': project_id
                }
            )

            # Add an entry in names.dmp with tax_id, sci_name, empty unique name, name_class (scientific name)
            entry = str(proposed_tax_id) + '\t|\t' + str(query['name']) + '\t|\t \t|\t' + 'scientific name \t|\n'
            with open(app_location_database + 'taxonomy/names.dmp', 'a+') as names_dmp:
                names_dmp.write(entry)
            print("DOWNLOAD_DATABASE: Added " + query['name'] + " entry in names.map file")
            self.update_state(
                state="PROGRESS",
                meta={
                    'percent-done': 45,
                    'message': "Added " + query['name'] + " entry in names.dmp file",
                    'project_id': project_id
                }
            )

            # Putting all the query sequences in one, input_sequences file.
            with open(app_location_database + 'input_sequences.fa', 'a+') as input_sequences:
                input_sequences.write('\n')

            with open(query['file'], 'rb') as query_file, open(app_location_database + 'input_sequences.fa',
                                                               'ab+') as input_sequences:
                shutil.copyfileobj(query_file, input_sequences)
            print("DOWNLOAD_DATABASE: Merged " + query['file'] + " sequence into input_sequences.fa file.")

            self.update_state(
                state="PROGRESS",
                meta={
                    'percent-done': 50,
                    'message': "Merged " + query['file'] + " sequence into input_sequences.fa file.",
                    'project_id': project_id
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

        print("DOWNLOAD_DATABASE: Downloading " + db_string + " database(s) from NCBI")
        self.update_state(
            state="PROGRESS",
            meta={
                'percent-done': 55,
                'message': "Downloading " + db_string + " database(s) from NCBI",
                'project_id': project_id
            }
        )
        cmd = ['centrifuge-download -o ' + app_location_database + 'library -m -d ' + db_string + ' refseq']
        print(f"CMD:\n {cmd}")
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
            print(str(exception))
            return "ER1"

        else:
            print("DOWNLOAD_DATABASE: Successfully downloaded " + db_string + " database(s) from NCBI")
            self.update_state(
                state="PROGRESS",
                meta={
                    'percent-done': 90,
                    'message': "Successfully downloaded " + db_string + "database(s) from NCBI",
                    'project_id': project_id
                }
            )

            import glob

            # Putting all the query sequences in one, input_sequences file.
            print("DOWNLOAD_DATABASE: Concatinating all the sequnce files.")
            self.update_state(state="PROGRESS",
                              meta={'percent-done': 95, 'message': "Concatenating all the sequence files.",
                                    'project_id': project_id}
                              )
            with open(app_location_database + 'input_sequences.fa', 'wb') as outfile:
                for filename in glob.glob(app_location_database + 'library/*/*.fna'):
                    with open(filename, 'rb') as readfile:
                        shutil.copyfileobj(readfile, outfile)

    # Generate database index.
    import datetime
    now = datetime.datetime.now()

    print("DOWNLOAD_DATABASE: Building the index.")
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
        print(str(exception))
        return "ER1"

    print("DOWNLOAD_DATABASE: Database has successfully been downloaded and built.")
    self.update_state(state="PROGRESS",
                      meta={
                          'percent-done': 100,
                          'message': "Database has successfully been downloaded and built.",
                          'app_location': app_location,
                          'minion': minion,
                          'project_id': project_id
                      })

    return {"minion": minion, "app_location": app_location}
