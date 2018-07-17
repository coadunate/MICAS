import random, os
import subprocess, json
from flask import Flask, render_template, request, url_for, copy_current_request_context, redirect

from flask_socketio import SocketIO, emit
from random import random
from time import sleep
from threading import Thread, Event
# from parse import krakenParse


import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from tasks import int_download_database


app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True
# app.config['CELERY_BROKER_URL'] = 'redis://localhost'
# app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost'
#
# celery = Celery('server', broker=app.config['CELERY_BROKER_URL'])
# celery.conf.update(app.config)

#turn the flask app into a socketio app
socketio = SocketIO(app)

fileListenerThread = Thread()
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
            final_kreport = open(self.ximp_loc + 'centrifuge/final.out.kraken','w')

            # path to centrifuge binary
            centrifuge = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge'
            centrifuge_kreport = '/Volumes/Courscant/Agriculture_Research/bin/centrifuge-kreport'

            # run centrifuge classification
            run_cent = subprocess.call([ \
                centrifuge, \
                '-x',self.ximp_loc + 'database/lambda-reference', \
                '-U',event.src_path, \
                '-f', \
                '-S', centrifuge_output, \
                '--report-file', centrifuge_report, \
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

                # Re-create the centrifuge kraken-style report
                run_kreport = subprocess.call([ \
                    centrifuge_kreport,
                    '-x',self.ximp_loc + 'database/lambda-reference', \
                    final_output,
                ],stdout=final_kreport,stderr=subprocess.DEVNULL)

                # Generate Sankey JSON data
                kraken_output = None
                print("Kraken Output:")
                print(kraken_output)




def run_fastq_watcher(ximp_loc):
    event_handler = FASQFileHandler(ximp_loc)
    observer = Observer()
    observer.schedule(event_handler, path=ximp_loc + 'reads', recursive=False)
    observer.start()

    while not thread_stop_event.isSet():
        sleep(1)
    self.observer.join();


@app.route('/')
def index():

    return render_template('index.html')


@app.route('/analysis')
def analysis():
    socketio.emit('fromanalysis',{'data': 'sample'},namespace="/analysis")

    print("WE ARE IN ANALYSIS")
    XIMP_LOCATION = '/Volumes/Courscant/XIMP_201875/'
    socketio.emit('newresp',{'data': 'this'}, namespace="/analysis")
    @socketio.on('connect', namespace='/analysis')
    def test_connect():
        # need visibility of the global thread object
        print("Client Connected")
        global fileListenerThread

        #Start the random number generator thread only if the thread has not been started before.
        if not fileListenerThread.isAlive():
            print("Starting the FASTA file listener thread")
            fileListenerThread = Thread(target=run_fastq_watcher(XIMP_LOCATION))
            fileListenerThread.start()
    return render_template('analysis.html')

@socketio.on('something',namespace="/analysis")
def do_something(data):
    print("DID SOMETHING ELSE")
    emit('resp_something',{'data': 'data'}, namespace="/analysis")


@socketio.on('download_database', namespace="/")
def download_database(dbinfo):
    print("RUNING")
    print(dbinfo)
    res = int_download_database.delay(dbinfo)
    print("WHILE IT RUNS")
    emit('go_to_analysis',{'url': url_for('analysis')}, namespace="/")


@app.route('/upload_database',methods=['POST'])
def upload_database():
    if request.method == 'POST':
        fields = [k for k in request]
        values = [request.form[k] for k in request.form]
        print(fields)
        print(values)
        return "SUCCESS"
    else:
        return "HMM! Something is fishy!"


@app.route('/scientific_name/<string:name>',methods=['GET'])
def scientific_name(name):
    data = ""
    found = []
    with open('scientific_names.js') as f:
        data = json.load(f)

    print(data[0])
    for item in data:
        if item["label"].lower().find(name.lower()) != -1:
            found.append(item)

    return json.dumps({ "count": len(found), "results": found })

@app.route('/validate_locations', methods=['POST','GET'])
def validate_locations():
    if( request.method == 'POST'):
        minION_location = request.form['minION']
        app_location = request.form['App']

        minION_output = subprocess.call(['ls', minION_location])
        app_output = subprocess.call(['ls', app_location])

        if(minION_output == 0 and app_output == 0):
            return json.dumps({ "code": 0, "message": "SUCCESS" })
        else:
            if minION_output == 1:
                return json.dumps([{ "code": 1, "message": "Invalid minION location"}])
            elif app_output == 1:
                return json.dumps([{ "code": 1, "message": "Invalid App location" }])
    else:
        return "N/a"



@app.route('/create_pre_db')
def create_pre_db():
    return "ERROR: Database creation is not implemented."

if __name__ == '__main__':
    # socketio.init_app(app)
    socketio.run(app,debug=True)
    # app.run(debug=True, threaded=True)
