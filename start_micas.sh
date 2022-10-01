#!/bin/bash

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
    create_conda_env_cmd="conda create -y -q -n micas python=3.8"
    print_and_run_cmd "$create_conda_env_cmd"

    # activate the newly created conda environment
    activate_conda_env

    # install server dependencies
    python -m pip install -r requirements.txt
fi

## 3.0 START MICAS ##

# create micas start script using osascript
cat <<EOF > micas_mac_setup.scpt
tell application "iTerm"
    activate
    
    -- create a new window
    tell application "System Events" to keystroke "n" using command down
    delay 1
    
    -- split the window vertically
    tell application "System Events" to keystroke "d" using command down
    delay 1
    
    -- go to the first part of the split
    tell application "System Events" to keystroke "[" using command down
    delay 1
    
    -- START UP REDIS & CELERY
    tell current session of current window
        write text "cd $(pwd)/server/app/main/utils"
        delay 1
        write text "conda activate micas"
        delay 1
        write text "redis-server &"
        delay 1
        write text "celery -A tasks worker --loglevel=INFO"
        delay 1
    end tell
    
    -- create a horizontal split
    tell application "System Events" to keystroke "D" using command down
    delay 1
    
    -- START UP FLASK BACKEND
    tell current session of current window
        write text "cd $(pwd)"
        delay 1
            write text "conda activate micas"
        delay 1
        write text "python server/micas.py"
    end tell
    
    -- go to the right split
    tell application "System Events" to keystroke "]" using command down
    delay 1
    
    -- START UP FLASK BACKEND
    tell current session of current window
        write text "cd $(pwd)"
        delay 1
    end tell
    
    -- create a horizontal split
    tell application "System Events" to keystroke "D" using command down
    delay 1
    
    -- START UP FRONT END
    tell current session of current window
        write text "cd $(pwd)/frontend"
        delay 1
        write text "npm install"
        delay 1
        write text "npm run start"
        delay 1
    end tell
    
end tell
EOF

if [ "$OS_TYPE" == "Mac" ]; then
    # run the script
    osascript micas_mac_setup.scpt
else
    echo "MICAS start script is only supported on Mac operating system"
fi




