import random
import subprocess, json
from flask import Flask, render_template, request

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analysis')
def analysis():
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
    app.run(debug=True, threaded=True)
