import random, os
import subprocess, json
from flask import Flask, render_template, request, url_for, copy_current_request_context, redirect

from flask_socketio import SocketIO, emit
from random import random
from time import sleep
from threading import Thread, Event


import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True

#turn the flask app into a socketio app
socketio = SocketIO(app)


thread = Thread()
thread_stop_event = Event()



class FASQFileHandler(FileSystemEventHandler):

    def __init__(self,ximp_loc):
        self.ximp_loc = ximp_loc

    def on_created(self, event):
        # if fastq file is created
        if event.src_path.endswith(".fasta"):
            socketio.emit('created_fastq', {'path': event.src_path}, namespace='/analysis')
            print('event type:', event.event_type , 'path :', event.src_path)

            # paths for centrifuge out file and centrifuge report file
            centrifuge_output = self.ximp_loc + 'centrifuge/runs/' + os.path.basename(event.src_path) + '.out.centrifuge'
            centrifuge_report = self.ximp_loc + 'centrifuge/runs/' + os.path.basename(event.src_path) + '.report.tsv'

            # paths for final output file and final report file
            final_output = self.ximp_loc + 'centrifuge/final.out.centrifuge'
            final_report = self.ximp_loc + 'centrifuge/final.report.tsv'

            # path to centrifuge binary
            centrifuge = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge'

            # run centrifuge classification
            run_cent = subprocess.call([ \
                centrifuge,
                '-x',self.ximp_loc + 'database/lambda-reference',
                '-U',event.src_path,
                '-f',
                '-S', centrifuge_output,
                '--report-file', centrifuge_report,
                ],stderr=subprocess.DEVNULL)

            # if running centrifuge was successful
            if run_cent == 0:

                # if the final report and output files already exist, append to them
                if subprocess.call(['ls',final_output]) == 0 and \
                   subprocess.call(['ls',final_report]) == 0:

                    open(final_output, "a").writelines([l for l in open(centrifuge_output).readlines()[1:]])
                    open(final_report, "a").writelines([l for l in open(centrifuge_report).readlines()[1:]])

                    subprocess.call(['rm',centrifuge_output])
                    subprocess.call(['rm',centrifuge_report])

                # if final report and output files do not exist, move the already
                # generated report and output files to the appropriate location,
                # also rename them as final report and output respectively.
                else:
                    subprocess.call(['mv',centrifuge_output,final_output])
                    subprocess.call(['mv',centrifuge_report,final_report])




def run_fastq_watcher(ximp_loc):
    event_handler = FASQFileHandler(ximp_loc)
    observer = Observer()
    observer.schedule(event_handler, path=ximp_loc + 'reads', recursive=False)
    observer.start()

    while not thread_stop_event.isSet():
        sleep(1)
    self.observer.join();




@socketio.on('disconnect', namespace='/analysis')
def test_disconnect():
    print('Client disconnected')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analysis')
def analysis():
    XIMP_LOCATION = '/Volumes/Courscant/XIMP_201875/'

    @socketio.on('connect', namespace='/analysis')
    def test_connect():
        # need visibility of the global thread object
        global thread
        print('Client connected')

        #Start the random number generator thread only if the thread has not been started before.
        if not thread.isAlive():
            print("Starting the FASTA file listener thread")
            thread = Thread(target=run_fastq_watcher(XIMP_LOCATION))
            thread.start()

    return render_template('analysis.html')


@app.route('/download_database', methods=['POST','GET'])
def download_database():
    if( request.method == 'POST' ):

        minION_location = request.form['minion']
        xWIMP_location = request.form['xwimp']
        bacteria = request.form['bacteria']
        archaea = request.form['archaea']
        virus = request.form['virus']

        # add trailing slashes if they don't exist
        xWIMP_location = xWIMP_location if xWIMP_location.endswith('/') else xWIMP_location + '/'
        minION_location = minION_location if minION_location.endswith('/') else minION_location + '/'


        centrifuge = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge'
        centrifuge_download = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge-download'

        # Download taxonomy
        # download_taxonomy_output = subprocess.call([centrifuge_download,'-o',xWIMP_location + 'taxonomy','taxonomy'])
        tax_folder_output = subprocess.call(['ls',xWIMP_location + 'taxonomy'])

        # Construct db_string first
        db_list = []
        if bacteria == "true":
            db_list.append('bacteria')
        if archaea == "true":
            db_list.append('archaea')
        if virus == "true":
            db_list.append('viral')

        db_string = ",".join([str(x) for x in db_list])

        # Download the database.
        seqid2taxid = open(xWIMP_location + 'seqid2taxid.map',"w+")
        std_err_file = open(xWIMP_location + 'download_error',"w+")
        download_bacteria_output = \
            subprocess.call([ \
                centrifuge_download,'-o', xWIMP_location + 'library','-m','-d',db_string, \
                'refseq'],stdout=seqid2taxid,stderr=std_err_file)


        return json.dumps({
            "minION": minION_location,
            "xWIMP": xWIMP_location,
            "predb": {
                "bacteria": bacteria,
                "archaea": archaea,
                "virus": virus
            }
        })
    else:
        return "N/a"

@app.route('/validate_locations', methods=['POST','GET'])
def validate_locations():
    if( request.method == 'POST'):
        minION_location = request.form['minION']
        xWIMP_location = request.form['xWIMP']

        minION_output = subprocess.call(['ls', minION_location])
        xWIMP_output = subprocess.call(['ls', xWIMP_location])

        if(minION_output == 0 and xWIMP_output == 0):
            return json.dumps({ "code": 0, "message": "SUCCESS" })
        else:
            if minION_output == 1:
                return json.dumps([{ "code": 1, "message": "Invalid minION location"}])
            elif xWIMP_output == 1:
                return json.dumps([{ "code": 1, "message": "Invalid xWIMP location" }])
    else:
        return "N/a"



@app.route('/create_pre_db')
def create_pre_db():
    return "ERROR: Database creation is not implemented."

if __name__ == '__main__':
    socketio.run(app)
    # app.run(debug=True, threaded=True)
