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
STEP=1

#################
## MAIN SCRIPT ##
#################

debug "Step $STEP: Figuring out environment command"
if command -v conda &>/dev/null; then
  ENVIRONMENT_CMD=conda
  debug "Environment command: conda"
else
  fatal_error "Conda is needed to run MICAS"
fi
STEP=$(($STEP+1))

debug "Step $STEP: Creating server environment"
if [ "$ENVIRONMENT_CMD" = "conda" ]; then
  create_conda_env_cmd="conda create -n micas_env python=3.6 -y -q"
  debug "$create_conda_env_cmd"
  echo "$create_conda_env_cmd" | bash
else
  fatal_error "No environment command found" \
    "Make sure that you have either virtualenv or conda installed"
fi
STEP=$(($STEP+1))

debug "Step $STEP: Sourcing to the environment"

eval "$($(which conda)  'shell.bash' 'hook')"
conda activate "micas_env"
debug "Now in $CONDA_DEFAULT_ENV"
STEP=$(($STEP+1))

debug "Step $STEP: Selecting download command"
if command -v curl &>/dev/null; then
  URL_CMD="curl"
elif command -v wget &>/dev/null; then
  URL_CMD="wget"
else
  fatal_error "curl or wget is required to continue"
fi
STEP=$(($STEP+1))

debug "Step $STEP: Installing server dependencies"
if [ "$URL_CMD" = "curl" ]; then
  pip_get_cmd="$URL_CMD https://bootstrap.pypa.io/get-pip.py | python3"
  debug "$pip_get_cmd"
  echo "$pip_get_cmd"| bash
else
  pip_get_cmd="$URL_CMD https://bootstrap.pypa.io/get-pip.py"
  debug "$pip_get_cmd"
  echo "$pip_get_cmd"| bash
fi
STEP=$(($STEP+1))

debug "Step $STEP: Installing setup tools"
setup_tools_cmd="pip install --upgrade setuptools"
debug "$setup_tools_cmd"
echo "$setup_tools_cmd" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Installing python requirements"
req_cmd="pip3 install -r $(dirname "$0")/server/requirements.txt --ignore-installed PyYAML"
debug "$req_cmd"
echo "$req_cmd" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Installing frontend dependencies"
if ! hash npm; then
  fatal_error "Node.js (npm) is needed to run MICAS"
fi
fend_dep_cmd="npm install --prefix $(dirname "$0")/static $(dirname "$0")/static"
debug "$fend_dep_cmd"
echo "$fend_dep_cmd" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Building the front-end reactJS application"
build_cmd="npm run build --prefix $(dirname "$0")/static"
echo "$build_cmd" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Installing redis"
if hash redis-server; then
  debug "Redis is installed"
else
  if [ "$URL_CMD" = "curl" ]; then
    url_dload_cmd="$URL_CMD -L http://download.redis.io/redis-stable.tar.gz | tar zx"
  else
    url_dload_cmd="$URL_CMD -O - http://download.redis.io/redis-stable.tar.gz | tar zx"
  fi
  debug "$url_dload_cmd"
  echo "$url_dload_cmd" | bash
fi
STEP=$(($STEP+1))

debug "Step $STEP: Checking if centrifuge is installed"
if hash centrifuge-build; then
  debug "Centrifuge is installed"
else
  if [ "$URL_CMD" = "curl" ]; then
    url_dload_cent_cmd="$URL_CMD -L https://codeload.github.com/infphilo/centrifuge/tar.gz/v1.0.3 | tar zx"
  else
    url_dload_cent_cmd="$URL_CMD -O - https://codeload.github.com/infphilo/centrifuge/tar.gz/v1.0.3 | tar zx"
  fi
  debug "$url_dload_cent_cmd"
  echo "$url_dload_cent_cmd" | bash
fi
STEP=$(($STEP+1))