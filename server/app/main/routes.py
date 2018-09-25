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
from .utils.notification import send_email, send_sms



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

@main.route('/get_timeline_info',methods=["GET"])
def get_timeline_info():
    if request.method == 'GET':
        app_location = request.args.get('app_location')
        app_location = app_location if app_location.endswith('/') else app_location + '/'

        if subprocess.call(['ls',app_location + 'analysis.timeline']) == 0:
            with open(app_location + 'analysis.timeline','r') as analysis_timeline:
                try:
                    line = analysis_timeline.readline()
                    (num_total_reads,num_classified_reads) = line.split("\t")

                    return json.dumps( \
                        { \
                            'status': 200, \
                            'num_total_reads': int(num_total_reads), \
                            'num_classified_reads': int(num_classified_reads) \
                        })

                except:
                    return json.dumps({ 'status': 404 })




@main.route('/get_sankey_data', methods=['GET'])
def get_sankey_data():
    if request.method == 'GET':
        app_location = request.args.get('app_location')
        app_location = app_location if app_location.endswith('/') else app_location + '/'

        if subprocess.call(['ls',app_location + 'centrifuge/sankey.data']) == 0:
            with open(app_location + 'centrifuge/sankey.data','r') as sankey_file:
                lines = sankey_file.read()
                if "None" in lines:
                    return json.dumps({ 'status': 204 })
                else:
                    try:
                        jsonRecord = ast.literal_eval(lines)
                        return json.dumps({ 'status': 200, 'nodes': jsonRecord[0], 'links': jsonRecord[1] })
                    except:
                        print("TAYAB! TAKE A LOOK!")
                        print(lines)
                        return json.dumps({ 'status': 404 })
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
            already_alerted_list = ""
            alert_sequences_threshold = 100
            email_address = None
            phone_number = None
            with open(app_location + 'alertinfo.cfg','r') as config_file:
                for line in config_file:
                    if "alert_sequences" in line:
                        alert_sequences_list = line
                    if "alert_sequence_threshold" in line:
                        alert_sequences_threshold = int(line.split("=")[1].strip())
                    if "email_address" in line:
                        email_address = line.split("=")[1].strip()
                    if "phone_number" in line:
                        phone_number = line.split("=")[1].strip()
                    if "already_alerted" in line:
                        already_alerted_list = line

            finalList = []
            otherFinalList = []



            alert_sequences_list = alert_sequences_list.split("=")[1].strip()
            alert_sequences_list = ast.literal_eval(alert_sequences_list)

            already_alerted_list = already_alerted_list.split("=")[1].strip()
            already_alerted_list = ast.literal_eval(already_alerted_list)

            for alert in alert_sequences_list:
                krakenResult = krakenReadCount(app_location + 'centrifuge/final.out.kraken',int(alert))
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

                    # Send an email if the # of reads are greater than the alert_sequence_threshold
                    if int(krakenResult[1]) >= alert_sequences_threshold and (alert not in already_alerted_list):
                        if email_address is not None:
                            send_email(krakenResult[2].strip(), krakenResult[1],email_address)
                        if phone_number is not None:
                            send_sms(krakenResult[2].strip(), krakenResult[1],phone_number)

                        # Update alertconfig file for already_alerted sequences.
                        other_info = ""
                        list_of_sequences = ""
                        line_number = -1
                        with open(app_location + 'alertinfo.cfg','r') as read_file:
                            for idx,line in enumerate(read_file):
                                if "already_alerted" not in line:
                                    other_info += line
                                else:
                                    list_of_sequences = line.split("=")[1]

                        list_of_sequences = ast.literal_eval(list_of_sequences.strip())
                        list_of_sequences.append(str(alert))
                        new_list_of_sequences = "already_alerted = " + str(list_of_sequences)
                        with open(app_location + 'alertinfo.cfg','w') as write_file:
                            write_file.write(other_info)
                            write_file.write(new_list_of_sequences)


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
