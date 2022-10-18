<font size=20>__MICAS v0.1 Manual__</font>


1. [About MICAS](#1-about-micas) </br>
2. [Installation](#2-installation)</br>
    2.1. [Automated Installation](#21-automated-installation)</br>
    2.2. [Manual Installation](#22-manual-installation)</br>
3. [Running MICAS](#3-running-micas)</br>
    3.1. [MICAS Setup](#31-micas-setup)</br>
    3.2. [MICAS Analysis](#32-micas-analysis)</br>
4. [Example Workflow](#4-example-workflow)</br>
5. [Citation](#5-citation)</br>
6. [Feedback and bug reports](#6-feedback-and-bug-reports)</br>

# 1. About MICAS

MinION Classification & Alerting System is a web application meant to be run
simultaneously with the MinION DNA sequencer. This app provides an alerting
system through which a scientist performing DNA sequencing runs could be
notified minknow style notifications or via a log file. The alerts could be set to respond
 to any particular sequences of interest arising in their sample. Our team
 believes that this will enable researchers to use their time more efficiently
 by allowing them to focus on more important matters in the meantime, rather
 than waiting around for significant sequences.

# 2. Installation

There are two ways to get up-and-running with MICAS. You can either install it
using our automated installation script. It will detect the current environment
and install required packages accordingly. Otherwise, you can follow our
detailed guide on how to install the software.

## 2.1. Automated Installation

The automated installation script has been developed for MacOS and Linux users
who would like to get MICAS ready without worrying about what components are
required to get it to work. The script has been designed to detect the
environment as well as the programs that are installed and adjusts its commands
accordingly. Assuming MICAS is being downloaded from GitHub, here are the set of 
commands one has to run to initiate the installation script, which will take care
of remaining steps:

1. Cloning the latest MICAS software
	
	```
	git clone https://github.com/coadunate/MICAS.git
	```

2. Entering into the cloned directory
	
	```
	cd MICAS
	```
3. Running the installation script

	```
	./install.sh
	```

After the installation has finished, you should be ready to start using MICAS.


## 2.2. Manual Installation

# 3. Running MICAS

~~Once you have successfully installed MICAS and are ready to run it, you can run
the pre-made script called `start.sh`, which should run the necessary 
programs and serve the webpage at:`http://127.0.0.1:5000/`. When you subscribe to
the above URL on your favourite web browser, you'll land on setup page. This
indicates that MICAS installation was successful and you are ready to do
science.~~ 

**NOTE**: Unfortunately, the `start.sh` script currently does not function, and needs to be fixed. Please use the bellow instructions regarding *"Running MICAS For Debugging"*.

## 3.1. Running MICAS For Debugging

Occasionally, one may feel inclined to run each of the individual portions of MICAS within
there own terminals, for easier error hanbdling. This can be achieved by running the following
commands, in any order:

### Start Redis server
```sh
redis-server
```
This step could fail if redis is not installed.

### Start Celery
```sh
cd ./server/app/main/utils
celery -A tasks worker --loglevel=INFO
```
This step could fail if celery is not installed.

### Start Front End
```sh
cd ./frontend
npm run start
```

### Start MICAS Server
```sh
python server/micas.py
```

With all the above running in seperate terminals, you can now delight in viewing each applications
error streams with relative ease. **NOTE:** The above is completely optional, and use of start.sh is reccomended
for most users.

## 3.2. MICAS Setup

The setup page is meant to setup the alerting system for a particular organism for
a particular MinION run. There are three components of the setup page which need 
to be filled in with relevent information before analysis.

**1. Database Selection**  
In this section you can select the database within which to search for your
alerts in your MinION run. For example, if you performing MinION run of nCOVID-19
virus, you would most certainly want to check off *Virus* in your database selection.

You also have a choice to insert your own FASTA sequences as databases, which may
or may not be included as alerts.
	
**2. Alerting**  
Once the database selection process has been complete, you can configure your 
alerting information. The primary notification system is the via notification through logs, indicated by the micas location, and via the UI on minknow GUI.
There is also a possibility to add more alering sequences in this component, which will be monitored during the MinION run.

**3. Configuration**  
Finally, in the confiuration section, you have to choose the directory to which
MinION reads will be deposited so that MICAS can access it and analyze. You also
have to provide an empty directory where MICAS can store its database and other
temporary files.


## 3.3. MICAS Analysis

# 4. Example Workflow

# 5. Citation

# 6. Feedback and bug reports
