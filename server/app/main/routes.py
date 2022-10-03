import ast
import json
import logging
import os
import random
import string
import subprocess

from flask import session, render_template, request
from . import main

logger = logging.getLogger()

@main.route('/version', methods=['GET'])
def version():
    return json.dumps({"version": "v0.0.2", "name": "MICAS PoC"})

@main.route('/get_timeline_info', methods=["GET"])
def get_timeline_info():
    if request.method == 'GET':
        micas_location = os.path.join(os.path.expanduser('~'), '.micas/') # Add to CONFIG
        micas_location = micas_location if micas_location.endswith('/') else micas_location + '/'
        if subprocess.call(['ls', micas_location + 'analysis.timeline']) == 0:
            with open(micas_location + 'analysis.timeline', 'r') as analysis_timeline:
                try:
                    line = analysis_timeline.readline()
                    (num_total_reads, num_classified_reads) = line.split("\t")

                    return json.dumps( \
                        { \
                            'status'              : 200, \
                            'num_total_reads'     : int(num_total_reads), \
                            'num_classified_reads': int(num_classified_reads) \
                            })

                except:
                    return json.dumps({'status': 404})


@main.route('/get_uid', methods=["POST"])
def get_uid():
    if request.method == "GET":
        return "Unexpected request method. Expected a GET request."

    # get the data
    minION_location = request.form['minION']
    micas_location = os.path.join(os.path.expanduser('~'), '.micas/') # Add to CONFIG

    # generate a random unique id
    uid = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(5))

    # check to see if this id already exists
    micas_cache_file = os.path.join(os.path.expanduser('~'), '.micas/.cache') # Add to CONGIG
    cache_dict = {"ids": [], "micas_paths": [], "minion_paths": []}
    if os.path.exists(micas_cache_file):
        with open(micas_cache_file) as cache_fs:
            for line in cache_fs:
                rec = line.split("\t")
                cache_dict["ids"].append(rec[0])
                cache_dict["micas_paths"].append(rec[1])
                cache_dict["minion_paths"].append(rec[2])

        # keep generating the uid until its unique
        while uid in cache_dict["ids"]:
            uid = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(5))

    # save the UI and MICAS to cache file
    micas_cache_file = os.path.join(os.path.expanduser('~'), '.micas/.cache') # Add to CONFIG
    entry = str(uid) + '\t' + str(minION_location) + '\t' + str(micas_location)
    with open(micas_cache_file, 'a+') as cache_fs:
        cache_fs.write(entry + "\n")

    return json.dumps({'uid': uid})


@main.route('/get_all_analyses', methods=['GET'])
def get_all_analyses():
    if request.method == "GET":
        micas_cache_file = os.path.join(os.path.expanduser('~'), '.micas/.cache') # Add to CONFIG
        data = []
        with open(micas_cache_file, 'r') as cache_fs:
            for line in cache_fs:
                [projectId, minion_dir, micas_dir] = line.split("\t")
                data.append({
                    "id"        : projectId,
                    "minion_dir": minion_dir,
                    "micas_dir" : micas_dir
                })

        return json.dumps({
            'status': 200,
            'data'  : data
        })

@main.route('/delete_analyses', methods=['POST'])
def delete_analyses():
    if request.method == "GET":
        return "Unexpected request method. Expected a GET request."

    # Get Post Data
    uid = request.form['uid']
    micas_cache_file = os.path.join(os.path.expanduser('~'), '.micas/.cache') # Add to CONFIG
    found = False
    with open(micas_cache_file, 'r+') as cache_fs:
        filtered_lines = []
        for line in cache_fs:
            if uid not in line:
                filtered_lines.append(line)
            else:
                logger.debug(f"Debug: Removed id {uid} from cache")
                found = True
        cache_fs.seek(0)
        cache_fs.write("".join(filtered_lines))
        cache_fs.truncate()
    return json.dumps({
        'status': 200,
        'found' : found
    })


@main.route('/get_analysis_info', methods=['GET'])
def get_analysis_info():
    if request.method == 'GET':
        uid = request.args.get('uid')

        # get minion and micas location
        micas_path = ""
        micas_cache_file = os.path.join(os.path.expanduser('~'), '.micas/.cache') # Add to CONFIG
        with open(micas_cache_file, 'r') as cache_fs:
            found = False
            for line in cache_fs:
                entry = line.split("\t")
                entry_id = entry[0]
                entry_micas_path = entry[2].rstrip()
                if uid == entry_id:
                    micas_path = entry_micas_path
                    found = True
                    break

        if not found:
            return json.dumps({'status': 404, 'message': "Couldn't find the analysis data with UID: " + uid})
        else:

            alert_cfg_file = os.path.join(micas_path, 'alertinfo.cfg')
            alert_cfg_obj = json.load(open(alert_cfg_file))

            return json.dumps({
                'status': 200,
                'data'  : alert_cfg_obj
            })

    else:
        return "Unexpected request method. Expected a GET request."


@main.route('/analysis', methods=['GET'])
def analysis():
    if (request.method == 'GET'):

        micas_location = os.path.join(os.path.expanduser('~'), '.micas/') # Add to CONFIG
        minion = request.args.get('minion')

        session['micas_location'] = micas_location
        session['minion'] = minion

        error = []

        # Location for the applicaiton data directory
        micas_location = micas_location if micas_location.endswith('/') else micas_location + '/'

        # check if micas_location is valid
        if subprocess.call(['ls', micas_location]) == 0:
            # if micas_location exists
            if subprocess.call(['ls', micas_location + 'alertinfo.cfg']) == 0:
                # if minion location exists
                if subprocess.call(['ls', minion]) == 0:
                    # locations are valid

                    # is another user already on that page? If so, bounce this user
                    if subprocess.call(['ls', micas_location + 'analysis_busy']) == 0:
                        error.append({'message': 'This route is busy. Please try again!'})
                    else:

                        analysis_started_date = None
                        if subprocess.call(['ls', micas_location + 'analysis_started']) == 0:
                            with open(micas_location + 'analysis_started', 'r') as f:
                                analysis_started_date = f.readline()
                        else:
                            import datetime, time
                            d = datetime.datetime.utcnow()
                            for_js = int(time.mktime(d.timetuple())) * 1000
                            analysis_started_date = for_js
                            with open(micas_location + 'analysis_started', 'w') as f:
                                f.write(str(analysis_started_date))

                        subprocess.call(['touch', micas_location + 'analysis_busy'])
                        return render_template('analysis.html', app_loc=micas_location, minion_loc=minion,
                                               start_time=analysis_started_date)
                else:
                    error.append({'message': 'MinION location is not valid.'})
            else:
                error.append({'message': 'Alert configuration file is not found.'})
        else:
            error.append({'message': 'App location was not found'})
    return json.dumps(error)

@main.route('/validate_locations', methods=['POST', 'GET'])
def validate_locations():
    if (request.method == 'POST'):
        minION_location = request.form['minION']
        micas_location = os.path.join(os.path.expanduser('~'), '.micas/') # Add to CONFIG

        minION_output_exists = os.path.exists(minION_location)
        app_output_exists = os.path.exists(micas_location) 

        logger.debug("minION_output = " + str(minION_output_exists))
        logger.debug("app_output_exists = " + str(app_output_exists))

        # create micas location if not excistant
        if not app_output_exists:
            os.mkdir(micas_location) 
            os.chmod(micas_location, mode=0o755)
            app_output_exists = True

        if (minION_output_exists and app_output_exists):
            return json.dumps({"code": 0, "message": "SUCCESS"})
        else:
            if not minION_output_exists:
                return json.dumps([{"code": 1, "message": f"Invalid minION location (err code {minION_output_exists})"}])
            elif not app_output_exists:
                return json.dumps([{"code": 1, "message": f"Invalid MICAS location (err code {app_output_exists})"}])
            else:
                return json.dumps([{"code": 1, "message": f"Unknown location error (minION_output_exists: {minION_output_exists}, micas_location: {app_output_exists}, query_output: {query_output})"}])
    else:
        return "N/A"
