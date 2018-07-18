from celery import Celery
import subprocess, envoy, os, shutil, random
from celery.exceptions import SoftTimeLimitExceeded


from Bio import Entrez

celery = Celery('tasks', broker='redis://localhost')

Entrez.email = 'tayab.soomro@usask.ca'

@celery.task
def add(x, y):
    return x + y

@celery.task
def int_download_database(db_data,queries):
    app_location = db_data['app_location']
    bacteria = db_data['bacteria']
    archaea = db_data['archaea']
    virus = db_data['virus']

    # add trailing slashes if they don't exist
    app_location = app_location if app_location.endswith('/') else app_location + '/'

    # Create variables for locations.
    app_location_database = app_location + 'database/'
    centrifuge = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge'
    centrifuge_download = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge-download'

    # Download taxonomy
    print("DOWNLOAD DATABASE: Downloading taxonomy files")
    tax_cmd = [centrifuge_download + ' -o ' + app_location_database + 'taxonomy taxonomy']
    try:
        tax_cmd_output = subprocess.Popen(tax_cmd,shell=True,stderr=subprocess.STDOUT)
        tax_cmd_output.communicate()
        tax_cmd_output.wait()
    except (OSError, subprocess.CalledProcessError) as exception:
            print(str(exception))
            return "ER0"
    else:
        print("DOWNLOAD DATABASE: Successfully downloaded taxonomy files")
        socketio.emit('downloaded_taxonomy', {}, namespace='/analysis')

    # Create seqid2taxid.map file

    seqid2taxid_file = open(app_location_database + 'seqid2taxid.map','a+')
    seqid2taxid_file.write('\n')
    print("DOWNLOAD DATABASE: Created seqid2taxid.map file")

    tmp = "NO_OUTPUT"

    if len(queries) == 0:
        print("DOWNLOAD DATABASE: No queries provided, skipping.")
    else:
        print("DOWNLOAD DATABASE: Entering queries into taxonomy files.")
    for query in queries:
        query_file = open(query['file'],'r')
        NCBI_id = query_file.readline().split(' ')[0][1:]

        # Generate non-existant tax_id from the given parent tax_id
        proposed_tax_id = ''
        already_seen_tax_id = []
        while True:
            randNum = random.randint(100,999)
            proposed_tax_id = query['parent'] + str(randNum)
            record = Entrez.read(Entrez.efetch(db='Taxonomy',id=proposed_tax_id,retmode='xml'))

            if len(record) == 0 and proposed_tax_id not in already_seen_tax_id:
                already_seen_tax_id.append(proposed_tax_id)
                break

        # Add an entry in seqid2taxid with NCBI's id and the tax_id
        print("DOWNLOAD_DATABASE: Added " + query['name'] + " entry in seqid2taxid.map file")
        seqid2taxid_file.write(str(NCBI_id) + '\t' + str(proposed_tax_id) + '\n')

        # Add an entry in nodes.dmp with parent tax_id, tax_id and rank (species)
        entry = str(proposed_tax_id) + '\t|\t' + str(query['parent']) + '\t|\t' + 'species\t|\n'
        with open(app_location_database + 'taxonomy/nodes.dmp','a+') as nodes_dmp:
            nodes_dmp.write(entry)
        print("DOWNLOAD_DATABASE: Added " + query['name'] + " entry in nodes.map file")

        # Add an entry in names.dmp with tax_id, sci_name, empty unique name, name_class (scientific name)
        entry = str(proposed_tax_id) + '\t|\t' + str(query['name']) + '\t|\t \t|\t' + 'scientific name \t|\n'
        with open(app_location_database + 'taxonomy/names.dmp','a+') as names_dmp:
            names_dmp.write(entry)
        print("DOWNLOAD_DATABASE: Added " + query['name'] + " entry in names.map file")

        # Putting all the query sequences in one, input_sequences file.
        with open(app_location_database + 'input_sequences.fa','a+') as input_sequences:
            input_sequences.write('\n')
        with open(query['file'], 'rb') as query_file, open(app_location_database + 'input_sequences.fa','ab+') as input_sequences:
            shutil.copyfileobj(query_file, input_sequences)
        print("DOWNLOAD_DATABASE: Merged " + query['file'] + " sequence into input_sequences.fa file.")





    # If user has requested to download NCBI's database
    if bacteria == True or archaea == True or virus == True:

        # Construct db_string first
        db_list = []
        if bacteria == True:
            db_list.append('bacteria')
        if archaea == True:
            db_list.append('archaea')
        if virus == True:
            db_list.append('viral')

        db_string = ",".join([str(x) for x in db_list])

        print("DOWNLOAD_DATABASE: Downloading " + db_string + " databases from NCBI")

        cmd = [centrifuge_download + ' -o ' + app_location_database + 'library -m -d ' + db_string + ' refseq']
        outfile = open(app_location_database + 'seqid2taxid.map','a+')
        errfile = open(app_location_database + 'download_err.txt','w')
        try:
            # Download the database.
            download_bacteria_output = subprocess.Popen(
                cmd,
                shell=True,
                stdout=outfile,
                stderr=errfile
            )
            download_bacteria_output.communicate()
            download_bacteria_output.wait()

        except (OSError, subprocess.CalledProcessError) as exception:
            print(str(exception))
            return "ER1"

        else:
            print("DOWNLOAD_DATABASE: Successfully downloaded " + db_string + " databases from NCBI")


    return tmp
