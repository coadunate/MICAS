#!/bin/bash

# assuming that this script is run after cd'ing into the MICAS folder
# otherwise change this to be the fully qualified path to the MICAS folder
# export MICAS_PATH=/path/to/MICAS
export MICAS_PATH=`pwd`

## 0.0 HELPFUL FUNCTIONS ##
find_in_conda_env() {
    conda env list | grep "${0}" 2>/dev/null
}

activate_conda_env() {
    eval "$(command conda 'shell.bash' 'hook' 2> /dev/null)"
    conda activate "micas"
    debug "Now in conda environment: $CONDA_DEFAULT_ENV"
}

print_and_run_cmd() {
    debug "${1}"
    ${1}
}

start_redis () {
    cd ${MICAS_PATH}/server/app/main/utils
    activate_conda_env
    redis-server &
}

start_celery () {
    cd ${MICAS_PATH}/server/app/main/utils
    activate_conda_env
    celery -A tasks worker --loglevel=INFO &
}

start_flask () {
    cd ${MICAS_PATH}
    activate_conda_env
    python server/micas.py &
}

start_node () {
    cd ${MICAS_PATH}/frontend
    npm install
    npm run start &
}

# print a debug message
debug() {
  if [ "$DEBUG" -eq 1 ]; then
    echo "[ DEBUG ][ $(date) ] -- $1"
  fi
}

# throw an error with message
fatal_error() {
  echo "ERROR: $1"
  echo "HINT: $2"
  exit 1
}

## 0.1 ENVIRONMENT VARIABLES ##

DEBUG=1
OS_TYPE=""

## 1.0 DETERMINE THE OS TYPE ##

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     OS_TYPE=Linux;;
    Darwin*)    OS_TYPE=Mac;;
    CYGWIN*)    OS_TYPE=Cygwin;;
    MINGW*)     OS_TYPE=MinGw;;
    *)          OS_TYPE="UNKNOWN:${unameOut}"
esac
echo ${OS_TYPE}

## 2. INSTALL DEPENDENCIES ##
## 2.1. SETUP CONDA ENVIRONMENT ##

# check to see if conda is installed
if command -v conda &>/dev/null; then
  debug "conda is installed"
else
  fatal_error "conda is needed to run MICAS"
fi

# check to see if the micas environment is already installed
if $(conda env list | grep -q "micas")
then
    debug "micas environment is already installed, activating..."
    activate_conda_env
else
    debug "micas environment is not installed, installing..."
    
    # create a new conda environment
#    create_conda_env_cmd="conda create -y -q -n micas python=3.8"
    create_conda_env_cmd="conda env create -f ${MICAS_PATH}/micas_env_mk1b.yml"
    print_and_run_cmd "$create_conda_env_cmd"

    # activate the newly created conda environment
    activate_conda_env

    # install server dependencies
#    python -m pip install -r requirements.txt
fi

## 3.0 START MICAS ##

# create micas start script using osascript

start_redis
start_flask
start_celery
start_node
wait
