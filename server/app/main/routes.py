from flask import session, redirect, url_for, render_template, request
from . import main

# for analysis
from flask_socketio import emit


# for scientific_names, validate_locations
import json

# for validate_locations
import subprocess

import os
import ast
import re

from .utils.parse import krakenReadCount


@main.route('/')
def index():
    return render_template('index.html')


@main.route('/is_database_downloaded', methods=['GET'])
def is_database_downloaded():
    if (request.method == 'GET'):
        app_location = request.args.get('app_location')
        app_location = app_location if app_location.endswith('/') else app_location + '/'

        if subprocess.call(['ls',app_location + '.download_in_progress']) == 0:
            return json.dumps({ 'status': 200 })
        else:
            return json.dumps({ 'status': 404 })
    else:
        return json.dumps({ 'status': 400 })

@main.route('/get_sankey_data', methods=['GET'])
def get_sankey_data():
    if request.method == 'GET':
        app_location = request.args.get('app_location')
        app_location = app_location if app_location.endswith('/') else app_location + '/'

        if subprocess.call(['ls',app_location + 'centrifuge/sankey.data']) == 0:
            with open(app_location + 'centrifuge/sankey.data','r') as sankey_file:
                line = sankey_file.readline()
                if "None" in line:
                    return json.dumps({ 'status': 204 })
                else:
                    jsonRecord = ast.literal_eval(line)
                    return json.dumps({ 'status': 200, 'nodes': jsonRecord[0], 'links': jsonRecord[1] })
        else:
            return json.dumps({ 'status': 404 })
    else:
        return json.dumps({ 'status': 400 })

@main.route('/get_alert_info', methods=['GET'])
def get_alert_info():
    if (request.method == 'GET'):
        app_location = request.args.get('app_location')
        app_location = app_location if app_location.endswith('/') else app_location + '/'


        if subprocess.call(['ls',app_location + 'alertinfo.cfg']) == 0:
            alert_sequences_list = ""
            alert_sequences_threshold = 100
            with open(app_location + 'alertinfo.cfg','r') as config_file:
                for line in config_file:
                    if "alert_sequences" in line:
                        alert_sequences_list = line
                        break
                    if "alert_sequence_threshold" in line:
                        print(line)
                        alert_sequences_threshold = int(line.split("=")[1].strip())

            finalList = []
            otherFinalList = []
            alert_sequences_list = alert_sequences_list.split("=")[1].strip()
            alert_sequences_list = ast.literal_eval(alert_sequences_list)
            for alert in alert_sequences_list:
                krakenResult = krakenReadCount(app_location + 'centrifuge/final.out.kraken',int(alert))
                print(krakenResult)
                if(krakenResult == None):

                    # with open(os.path.abspath('./app/main/data/scientific_names.json'),'r') as f:
                    #     for line in f:
                    #         if alert in line:
                    #             name = re.search(r'\"label\":\W(\"[^"]{1,}\")', line).group(1)
                    #             int_dict = {"tax_id": int(alert), "name": alert, "num_reads": 0 }
                    #             otherFinalList.append(int_dict)
                    #             break
                    int_dict = {"tax_id": int(alert), "name": alert, "num_reads": 0 }
                    otherFinalList.append(int_dict)
                else:
                    # taxid, num_reads, name
                    int_dict = {"tax_id": int(alert), "name": krakenResult[2].rstrip(), "num_reads": krakenResult[1] }
                    finalList.append(int_dict)

            if(len(finalList) > 0):
                return json.dumps({ 'status': 200, 'alerts': finalList, 'alert_sequences_threshold': alert_sequences_threshold })
            elif(len(otherFinalList) > 0):
                return json.dumps({ 'status': 200, 'alerts': otherFinalList, 'alert_sequences_threshold': alert_sequences_threshold  })
        else:
            return json.dumps({ 'status': 404 })
    else:
        return json.dumps({ 'status': 400 })


@main.route('/analysis',methods=['GET'])
def analysis():

    if (request.method == 'GET'):

        app_location = request.args.get('app_location')
        minion = request.args.get('minion')

        session['app_location'] = app_location
        session['minion'] = minion

        error = []

        # Location for the applicaiton data directory
        app_location = app_location if app_location.endswith('/') else app_location + '/'


        # check if app_location is valid
        if subprocess.call(['ls',app_location]) == 0:
            # if app_location exists
            if subprocess.call(['ls',app_location + 'alertinfo.cfg']) == 0:
                # if minion location exists
                if subprocess.call(['ls',minion]) == 0:
                    # locations are valid

                    # is another user already on that page? If so, bounce this user
                    if subprocess.call(['ls',app_location + 'analysis_busy']) == 0 and False:
                        error.append({'message': 'This route is busy. Please try again!'})
                    else:

                        analysis_started_date = None
                        if subprocess.call(['ls', app_location + 'analysis_started']) == 0:
                            with open(app_location + 'analysis_started','r') as f:
                                analysis_started_date = f.readline()
                        else:
                            import datetime, time
                            d = datetime.datetime.utcnow()
                            for_js = int(time.mktime(d.timetuple())) * 1000
                            analysis_started_date = for_js
                            print("D: " + str(d))
                            print("FOR_JS: " + str(for_js))
                            with open(app_location + 'analysis_started','w') as f:
                                f.write(str(analysis_started_date))

                        subprocess.call(['touch',app_location + 'analysis_busy'])
                        return render_template('analysis.html',app_loc=app_location,minion_loc=minion,start_time=analysis_started_date)
                else:
                    error.append({'message': 'MinION location is not valid.'})
            else:
                error.append({'message': 'Alert configuration file is not found.'})
        else:
            error.append({'message': 'App location was not found'})
    return json.dumps(error)


@main.route('/validate_locations', methods=['POST','GET'])
def validate_locations():
    if( request.method == 'POST'):
        print("INSIDE VALIDATE_LOCATIONS")
        minION_location = request.form['minION']
        app_location = request.form['App']
        queries = request.form['Queries']

        _queries = queries.split(';')[:-1]

        if(len(_queries) > 0):
            query_output = -1
            for query in _queries:
                query_output = subprocess.call(['ls',query])
        else:
            query_output = 0

        minION_output = subprocess.call(['ls', minION_location])
        app_output = subprocess.call(['ls', app_location])

        centrifuge_output = -1
        centrifuge_output = subprocess.call(['which', 'centrifuge']) + \
                            subprocess.call(['which', 'centrifuge-download']) + \
                            subprocess.call(['which', 'centrifuge-kreport']) + \
                            subprocess.call(['which', 'centrifuge-build'])


        print("minION_output = " + str(minION_output))
        print("app_output = " + str(app_output))
        print("query_output = " + str(query_output))
        print("centrifuge_output = " + str(centrifuge_output))


        if(minION_output == 0 and app_output == 0 and query_output == 0 and centrifuge_output == 0):
            return json.dumps({ "code": 0, "message": "SUCCESS" })
        else:
            if minION_output == 1:
                return json.dumps([{ "code": 1, "message": "Invalid minION location"}])
            elif app_output == 1:
                return json.dumps([{ "code": 1, "message": "Invalid App location" }])
            return json.dumps([{ "code": 1, "message": "Invalid Queries location"}])
    else:
        return "N/a"