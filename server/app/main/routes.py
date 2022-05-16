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
    return json.dumps({"version": "v0.0.1", "name": "MICAS PoC"})


@main.route('/get_timeline_info', methods=["GET"])
def get_timeline_info():
    if request.method == 'GET':
        app_location = request.args.get('app_location')
        app_location = app_location if app_location.endswith('/') else app_location + '/'

        if subprocess.call(['ls', app_location + 'analysis.timeline']) == 0:
            with open(app_location + 'analysis.timeline', 'r') as analysis_timeline:
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
    app_location = request.form['App']

    # generate a random unique id
    uid = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(5))

    # check to see if this id already exists
    micas_cache_file = os.getenv('HOME') + "/.micas"
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
    micas_cache_file = os.getenv('HOME') + '/.micas'
    entry = str(uid) + '\t' + str(minION_location) + '\t' + str(app_location)
    with open(micas_cache_file, 'a+') as cache_fs:
        cache_fs.write(entry + "\n")

    return json.dumps({'uid': uid})


@main.route('/get_all_analyses', methods=['GET'])
def get_all_analyses():
    if request.method == "GET":
        micas_cache_file = os.getenv("HOME") + '/.micas'
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
    micas_cache_file = os.getenv("HOME") + '/.micas'
    found = False
    with open(micas_cache_file, 'r+') as cache_fs:
        filtered_lines = []
        for line in cache_fs:
            if uid not in line:
                filtered_lines.append(line)
            else:
                logger.debug(f"Removed id {uid} from cache")
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
        minion_path = ""
        micas_cache_file = os.getenv("HOME") + '/.micas'
        with open(micas_cache_file, 'r') as cache_fs:
            found = False
            for line in cache_fs:
                entry = line.split("\t")
                entry_id = entry[0]
                entry_micas_path = entry[2].rstrip()
                entry_minion_path = entry[1].rstrip()
                if uid == entry_id:
                    micas_path = entry_micas_path
                    minion_path = entry_minion_path
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

        app_location = request.args.get('app_location')
        minion = request.args.get('minion')

        session['app_location'] = app_location
        session['minion'] = minion

        error = []

        # Location for the applicaiton data directory
        app_location = app_location if app_location.endswith('/') else app_location + '/'

        # check if app_location is valid
        if subprocess.call(['ls', app_location]) == 0:
            # if app_location exists
            if subprocess.call(['ls', app_location + 'alertinfo.cfg']) == 0:
                # if minion location exists
                if subprocess.call(['ls', minion]) == 0:
                    # locations are valid

                    # is another user already on that page? If so, bounce this user
                    if subprocess.call(['ls', app_location + 'analysis_busy']) == 0 and False:
                        error.append({'message': 'This route is busy. Please try again!'})
                    else:

                        analysis_started_date = None
                        if subprocess.call(['ls', app_location + 'analysis_started']) == 0:
                            with open(app_location + 'analysis_started', 'r') as f:
                                analysis_started_date = f.readline()
                        else:
                            import datetime, time
                            d = datetime.datetime.utcnow()
                            for_js = int(time.mktime(d.timetuple())) * 1000
                            analysis_started_date = for_js
                            logger.debug("D: " + str(d))
                            logger.debug("FOR_JS: " + str(for_js))
                            with open(app_location + 'analysis_started', 'w') as f:
                                f.write(str(analysis_started_date))

                        subprocess.call(['touch', app_location + 'analysis_busy'])
                        return render_template('analysis.html', app_loc=app_location, minion_loc=minion,
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
        app_location = request.form['App']

        minION_output = subprocess.call(['ls', minION_location])
        app_output = subprocess.call(['ls', app_location])

        logger.debug("minION_output = " + str(minION_output))
        logger.debug("app_output = " + str(app_output))

        if (minION_output == 0 and app_output == 0):
            return json.dumps({"code": 0, "message": "SUCCESS"})
        else:
            if minION_output != 0:
                return json.dumps([{"code": 1, "message": f"Invalid minION location (err code {minION_output})"}])
            elif app_output != 0:
                return json.dumps([{"code": 1, "message": f"Invalid App location (err code {app_output})"}])
            else:
                return json.dumps([{"code": 1, "message": f"Unknown location error (minION_output: {minION_output}, app_output: {app_output}, query_output: {query_output})"}])
    else:
        return "N/A"
