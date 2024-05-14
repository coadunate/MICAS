import os
import json
import uuid
import logging
import subprocess
from flask import Flask, request, session, render_template, jsonify
from . import main
from .utils import LinuxNotification

# Setup logger
logger = logging.getLogger('micas')

def construct_micas_path():
    """Construct and return the base MICAS directory path."""
    micas_base_path = os.path.join(os.path.expanduser('~'), '.micas')
    return f"{micas_base_path}/" if not micas_base_path.endswith('/') else micas_base_path

def read_cache(cache_file):
    """Reads the cache file and returns a list of existing UUIDs."""
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as file:
            return [line.strip().split('\t')[0] for line in file]
    return []

def append_to_cache(cache_file, entry):
    """Appends a new entry to the cache file."""
    with open(cache_file, 'a+') as file:
        file.write(entry + "\n")

@main.route('/version', methods=['GET'])
def version():
    """Return the application version."""
    return jsonify({"version": "v0.0.2", "name": "MICAS PoC"})

@main.route('/get_timeline_info', methods=['GET'])
def get_timeline_info():
    """Return timeline information if available."""
    micas_location = construct_micas_path()
    analysis_timeline_path = os.path.join(micas_location, 'analysis.timeline')

    if os.path.exists(analysis_timeline_path):
        with open(analysis_timeline_path, 'r') as analysis_timeline:
            try:
                num_total_reads, num_classified_reads = analysis_timeline.readline().split("\t")
                return jsonify({
                    'status': 200,
                    'num_total_reads': int(num_total_reads),
                    'num_classified_reads': int(num_classified_reads)
                })
            except Exception as e:
                logger.error(f"Error reading analysis timeline: {e}")
                return jsonify({'status': 404})
    return jsonify({'status': 404})


@main.route('/get_uid', methods=["POST"])
def get_uid():
    """Generates and returns a unique identifier for a new analysis request."""
    if request.method != "POST":
        return jsonify(error="Unexpected request method. Expected a POST request."), 405

    micas_base_path = construct_micas_path()
    cache_file = os.path.join(micas_base_path, '.cache')

    # Ensure the MICAS base directory and cache file exist
    os.makedirs(micas_base_path, exist_ok=True)
    open(cache_file, 'a').close()  # Ensure the cache file exists

    # Generate a UUID and ensure it is unique
    existing_ids = read_cache(cache_file)
    uid = uuid.uuid4().hex
    while uid in existing_ids:
        uid = uuid.uuid4().hex

    # Create directory for the UID
    uid_dir = os.path.join(micas_base_path, uid)
    os.makedirs(uid_dir, exist_ok=True)

    # Append new entry to the cache
    minION_location = request.form.get('minION')
    entry = '\t'.join([uid, uid_dir, minION_location])
    append_to_cache(cache_file, entry)

    return jsonify(uid=uid)


@main.route('/get_all_analyses', methods=['GET'])
def get_all_analyses():
    """Returns a list of all analyses."""
    micas_cache_file = os.path.join(construct_micas_path(), '.cache')
    data = []

    if os.path.exists(micas_cache_file):
        with open(micas_cache_file, 'r') as cache_fs:
            for line in cache_fs:
                projectId, minion_dir, micas_dir = line.strip().split("\t")
                data.append({
                    "id": projectId,
                    "minion_dir": minion_dir,
                    "micas_dir": micas_dir
                })

    return jsonify({'status': 200, 'data': data})

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

    # delete the micas directory for the uid
    uid_dir = os.path.join(os.path.expanduser('~'), '.micas/' + uid) # Add to CONFIG
    if os.path.exists(uid_dir):
        subprocess.call(['rm', '-rf', uid_dir])
    
    return json.dumps({
        'status': 200,
        'found' : found
    })

@main.route('/get_analysis_info', methods=['GET'])
def get_analysis_info():
    """Returns analysis information based on UID."""
    uid = request.args.get('uid')
    if not uid:
        return jsonify({'status': 400, 'message': "UID is required"}), 400

    micas_cache_file = os.path.join(construct_micas_path(), '.cache')

    # Attempt to find the MICAS path for the given UID
    micas_path = None
    try:
        with open(micas_cache_file, 'r') as cache_fs:
            for line in cache_fs:
                entry = line.strip().split("\t")
                if uid == entry[0]:
                    micas_path = entry[1]
                    break
            if not micas_path:
                return jsonify({'status': 404, 'message': f"Couldn't find the analysis data with UID: {uid}"}), 404
    except FileNotFoundError:
        return jsonify({'status': 500, 'message': "Cache file not found"}), 500
    except Exception as e:
        return jsonify({'status': 500, 'message': str(e)}), 500

    # Read and return alert configuration
    alert_cfg_file = os.path.join(micas_path, 'alertinfo.cfg')
    try:
        with open(alert_cfg_file, 'r') as file:
            alert_cfg_obj = json.load(file)
            return jsonify({'status': 200, 'data': alert_cfg_obj}), 200
    except FileNotFoundError:
        return jsonify({'status': 404, 'message': "Alert configuration file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({'status': 500, 'message': "Error decoding the alert configuration file"}), 500
    except Exception as e:
        return jsonify({'status': 500, 'message': str(e)}), 500

@main.route('/analysis', methods=['GET'])
def analysis():
    """Handles the analysis request and renders the analysis page."""
    micas_location = construct_micas_path()
    minion = request.args.get('minion')

    session['micas_location'] = micas_location
    session['minion'] = minion

    error = []

    # Location for the application data directory
    analysis_busy_path = os.path.join(micas_location, 'analysis_busy')
    analysis_started_path = os.path.join(micas_location, 'analysis_started')
    alert_info_path = os.path.join(micas_location, 'alertinfo.cfg')

    if not os.path.exists(micas_location):
        error.append({'message': 'App location was not found'})
    elif not os.path.exists(alert_info_path):
        error.append({'message': 'Alert configuration file is not found.'})
    elif not os.path.exists(minion):
        error.append({'message': 'MinION location is not valid.'})
    elif os.path.exists(analysis_busy_path):
        error.append({'message': 'This route is busy. Please try again!'})
    else:
        analysis_started_date = None
        if os.path.exists(analysis_started_path):
            with open(analysis_started_path, 'r') as f:
                analysis_started_date = f.readline().strip()
        else:
            import datetime, time
            d = datetime.datetime.utcnow()
            analysis_started_date = int(time.mktime(d.timetuple())) * 1000
            with open(analysis_started_path, 'w') as f:
                f.write(str(analysis_started_date))

        subprocess.call(['touch', analysis_busy_path])
        return render_template('analysis.html', app_loc=micas_location, minion_loc=minion, start_time=analysis_started_date)

    return jsonify(error)

@main.route('/validate_locations', methods=['POST'])
def validate_locations():
    """Validates the provided MinION and MICAS locations."""
    minION_location = request.form.get('minION')
    micas_location = construct_micas_path()

    minION_output_exists = os.path.exists(minION_location)
    app_output_exists = os.path.exists(micas_location)

    logger.debug("minION_output = " + str(minION_output_exists))
    logger.debug("app_output_exists = " + str(app_output_exists))

    if not app_output_exists:
        os.mkdir(micas_location)
        os.chmod(micas_location, mode=0o755)
        app_output_exists = True

    if minION_output_exists and app_output_exists:
        return jsonify({"code": 0, "message": "SUCCESS"})
    else:
        if not minION_output_exists:
            return jsonify({"code": 1, "message": "Invalid MinION location"})
        if not app_output_exists:
            return jsonify({"code": 1, "message": "Invalid MICAS location"})
        return jsonify({"code": 1, "message": "Unknown location error"})

@main.route('/index_devices', methods=['GET'])
def index_devices():
    if (request.method == 'GET'):
        devices = []
        indexed_devices = LinuxNotification.index_devices()
        if len(indexed_devices) > 0:
            for device in indexed_devices:
                if device.state != "STATE_HARDWARE_REMOVED" \
                    or device.state != "STATE_HARDWARE_ERROR" \
                    or device.state != "STATE_SOFTWARE_ERROR":
                    devices.append(device.name)
                    LinuxNotification.send_notification(device.name, "Device discovered by MICAS", severity=1)
        
        

        return json.dumps(devices)