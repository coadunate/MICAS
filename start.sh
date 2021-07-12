#!/bin/bash
#####################################################################
#---------------- MICAS START SCRIPT ------------#
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

DEBUG=2
STEP=1
OS_TYPE=""

#################
## MAIN SCRIPT ##
#################

# NOTE: It is expected that install.sh has been run at least once prior to this script

debug "Step $STEP: Checking OS"
if [ "$(uname)" = "Darwin" ]; then
    OS_TYPE="OSX"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    OS_TYPE="LINUX"
else
    fatal_error "Currently, the operating system you are using is unsupported by MICAS. Please use either Mac OS X or Linux"
fi
STEP=$(($STEP+1))

debug "Step $STEP: Creating micas file structure..."
mkdir Files-MICAS
mkdir -p Files-MICAS/micas_data
mkdir -p Files-MICAS/minion_data
STEP=$(($STEP+1))

debug "Step $STEP: Starting micas server..."
# Starts micas_env created with the install.sh
eval "$(command conda 'shell.bash' 'hook' 2> /dev/null)"
conda activate "micas_env"
echo "python ./server/micas.py &" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Starting redis-server..."
echo "./redis-stable/src/redis-server &" | bash
STEP=$(($STEP+1))

debug "Step $STEP: Starting Celery worker..."
cd ./server/app/main/utils/
echo "celery -A tasks worker --loglevel=INFO &" | bash
STEP=$(($STEP+1))