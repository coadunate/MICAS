from celery import Celery
import subprocess, envoy
from celery.exceptions import SoftTimeLimitExceeded

celery = Celery('tasks', broker='redis://localhost')

@celery.task
def add(x, y):
    return x + y

@celery.task
def int_download_database(db_data):
    minION_location = db_data['minion']
    app_location = db_data['app_location']
    bacteria = db_data['bacteria']
    archaea = db_data['archaea']
    virus = db_data['virus']

    # add trailing slashes if they don't exist
    app_location = app_location if app_location.endswith('/') else app_location + '/'
    minION_location = minION_location if minION_location.endswith('/') else minION_location + '/'


    centrifuge = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge'
    centrifuge_download = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge-download'

    # Download taxonomy
    # download_taxonomy_output = subprocess.call([centrifuge_download,'-o',app_location + 'taxonomy','taxonomy'])

    # Construct db_string first
    db_list = []
    if bacteria == True:
        db_list.append('bacteria')
    if archaea == True:
        db_list.append('archaea')
    if virus == True:
        db_list.append('viral')

    db_string = ",".join([str(x) for x in db_list])

    print(bacteria == True, archaea, virus)
    print(db_list)


    cmd = [centrifuge_download + ' -o ' + app_location + 'library -m -d ' + db_string + ' refseq']
    outfile = open(app_location + 'seqid2taxid.map','w')
    errfile = open(app_location + 'download_err.txt','w')
    print("COMMAND: ")
    print(cmd)
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
        print("PROCESS FINISHED")

    return download_bacteria_output.returncode
