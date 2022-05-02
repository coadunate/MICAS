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
OS_TYPE=""

#################
## MAIN SCRIPT ##
#################

debug "Step $STEP: Checking OS"
if [ "$(uname)" = "Darwin" ]; then
    OS_TYPE="OSX"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    OS_TYPE="LINUX"
else
    fatal_error "Currently, the operating system you are using is unsupported by MICAS. Please use either Mac OS X or Linux"
fi
STEP=$(($STEP+1))

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
  # create_conda_env_cmd="conda create -n micas_env python=3.6 -y -q"
  curl -fsSL https://raw.githubusercontent.com/coadunate/MICAS/master/server/environment.yml --output env.yml
  create_conda_env_cmd="conda env create -n micas_env python=3.9 -q -f env.yml" # Uncomment for YAML build
  debug "$create_conda_env_cmd"
  echo "$create_conda_env_cmd" | bash
else
  fatal_error "No environment command found" \
    "Make sure that you have either virtualenv or conda installed"
fi
STEP=$(($STEP+1))

debug "Step $STEP: Sourcing to the environment"

eval "$(command conda 'shell.bash' 'hook' 2> /dev/null)"
conda activate "micas_env"
debug "Now in conda environment: $CONDA_DEFAULT_ENV"
STEP=$(($STEP+1))

debug "Step $STEP: Installing frontend dependencies"
if ! hash npm; then
  fatal_error "Node.js (npm) is needed to run MICAS"
fi
fend_dep_cmd="npm install --prefix $(dirname "$0")/frontend $(dirname "$0")/frontend"
debug "$fend_dep_cmd"
echo "$fend_dep_cmd" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Building the front-end reactJS application"
build_cmd="npm run build --prefix $(dirname "$0")/frontend"
echo "$build_cmd" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Installing redis"
if hash redis-server; then
  debug "Redis is installed"
else
  fatal_error "Please ensure redis is installed, either through brew or apt-get"
fi
STEP=$(($STEP+1))

debug "Step $STEP: Checking if R-lang is installed"
if hash R; then
  debug "R-lang is installed"
else
  fatal_error "R-Language is needed to run MICAS"
fi
STEP=$(($STEP+1))