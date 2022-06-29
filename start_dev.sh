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

conda create -y -n micas python=3.8
eval "$(conda shell.bash hook)"
conda activate micas
conda config --append channels conda-forge 
conda config --append channels bioconda
conda install -y curl redis-server gcc libffi nodejs minimap2 lsof
pip install --upgrade pip
pip install --default-timeout=100 -r requirements.txt
cd ./frontend
npm install
cd ..

debug "Step $STEP: Starting redis-server..."
redis-server &1> redis.log 
STEP=$(($STEP+1))

debug "Step $STEP: Starting celery..."
cd ./server/app/main/utils
celery -A tasks worker --loglevel=INFO &
STEP=$(($STEP+1))

debug "Step $STEP: Starting front end.."
cd ../../../../frontend
npm run start &
STEP=$(($STEP+1))

debug "Step $STEP: Starting MICAS!"
cd ..
python3 server/micas.py
STEP=$(($STEP+1))

# Wait for any process to exit
wait -n
  
# Exit with status of process that exited first
exit $?