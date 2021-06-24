#!/bin/bash
#####################################################################
#---------------- MICAS DEPENDENCIES INSTALLATION SCRIPT ------------#
#####################################################################

######################
## HELPER FUNCTIONS ##
######################

# print a debug message
debug() {
  if [ "$DEBUG" -eq 1 ] || [ "$DEBUG" -eq 2 ]; then
    echo "[ DEBUG ][ $(date) ] -- $1"
  fi
}

# throw an error with message
fatal_error() {
  echo "ERROR: $1"
  echo "HINT: $2"
  exit 1
}

ENVIRONMENT_CMD=""

DEBUG=2

#################
## MAIN SCRIPT ##
#################

debug "Step 1: Figuring out environment command"
if command -v virtualenv &>/dev/null; then
  ENVIRONMENT_CMD=virtualenv
  debug "Envrionment command: virtualenv"
elif command -v conda &>/dev/null; then
  ENVIRONMENT_CMD=conda
  debug "Environment command: conda"
fi

debug "Step 2: Creating server environment"
if [ "$ENVIRONMENT_CMD" = "virtualenv" ]; then

  create_virtual_env_cmd="virtualenv -p python3 $(date)/server/micas_env"
  debug "$create_virtual_env_cmd"
  echo "$create_virtual_env_cmd" | bash

  source "$(dirname "$0")"/server/micas_env/bin/activate

elif [ "$ENVIRONMENT_CMD" = "conda" ]; then
  create_conda_env_cmd="conda create -n micas_env python=3.6 -y -q"
  debug "$create_conda_env_cmd"
  echo "$create_conda_env_cmd" | bash
else
  fatal_error "No environment command found" \
    "Make sure that you have either virtualenv or conda installed"
fi

debug "Step 3: Sourcing to the environment"
if [ "$ENVIRONMENT_CMD" = "virtualenv" ]; then

  src_cmd="source $(dirname "$0")/server/micas_env/bin/activate"
  debug "$src_cmd"
  echo "$src_cmd" | bash

elif [ "$ENVIRONMENT_CMD" = "conda" ]; then
  # TODO: The conda activate command does not work properly and this is
  #  required for installing server dependencies in the following step.
  activate_conda_cmd="conda activate micas_env"
  debug "$activate_conda_cmd"
  echo "$activate_conda_cmd" | bash
fi

debug "Step 4: Installing server dependencies"
if command -v curl &>/dev/null; then
  curl_cmd="curl https://bootstrap.pypa.io/get-pip.py | python3"
  debug "$curl_cmd"
  echo "$curl_cmd" | bash
elif command -v wget &>/dev/null; then
  wget_cmd="wget https://bootstrap.pypa.io/get-pip.py"
  debug "$wget_cmd"
  echo "$wget_cmd" | bash

  pip_cmd="python3 get-pip.py"
  debug "$pip_cmd"
  echo "$pip_cmd" | bash
else
  fatal_error "You need either curl or wget for this"
fi

debug "Step 5: Installing Setup tools"
setup_tools_cmd="pip install --upgrade setuptools"
debug "$setup_tools_cmd"
echo "$setup_tools_cmd" | bash

debug "Step 6: Installing Python requirements"
req_cmd="pip3 install -r $(dirname "$0")/server/requirements.txt --ignore-installed PyYAML"
debug "$req_cmd"
echo "$req_cmd" | bash

debug "Step 7: Installing frontend dependencies"
fend_dep_cmd="npm install --prefix $(dirname "$0")/static $(dirname "$0")/static"
debug "$fend_dep_cmd"
echo "$fend_dep_cmd" | bash

debug "Step 8: Building the front-end ReactJS application"
build_cmd="npm run build --prefix $(dirname "$0")/static"
echo "$build_cmd" | bash

debug "Step 9: Installing redis"
if command -v redis-server &>/dev/null; then
  debug "Redis is installed"
else
  if command -v wget &>/dev/null; then
    curl_dload_cmd="wget http://download.redis.io/redis-stable.tar.gz"
    debug "$curl_dload_cmd"
    echo "$curl_dload_cmd" | bash

  elif command -v curl &>/dev/null; then
    wget_dload_cmd="curl http://download.redis.io/redis-stable.tar.gz"
    debug "$wget_dload_cmd"
    echo "$wget_dload_cmd" | bash

  fi

  ext_cmd="tar -xzvf redis-stable.tar.gz"
  debug "$ext_cmd"
  echo "$ext_cmd" | bash
fi

debug "Step 10: Checking if centrifuge is installed"
if hash centrifuge-build; then
  debug "Centrifuge is installed"
else
  if command -v wget &>/dev/null; then
    wget_dload_cent_cmd="wget https://github.com/infphilo/centrifuge/archive/v1.0.3.tar.gz"
    debug "$wget_dload_cent_cmd"
    echo "$wget_dload_cent_cmd" | bash

  elif command -v curl &>/dev/null; then
    curl_dload_cent_cmd="curl https://github.com/infphilo/centrifuge/archive/v1.0.3.tar.gz"
    debug "$curl_dload_cent_cmd"
    echo "$curl_dload_cent_cmd" | bash
    curl https://github.com/infphilo/centrifuge/archive/v1.0.3.tar.gz
  fi

  ext_cent_cmd="tar -xzvf v1.0.3.tar.gz"
  debug "$ext_cent_cmd"
  echo "$ext_cent_cmd" | bash

fi
