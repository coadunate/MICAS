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
notified through their email or text message. The alerts could be set to respond
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

Once you have successfully installed MICAS and are ready to run it, you can run
the pre-made script called `run_micas.sh`, which should run the necessary 
programs and serve the webpage at:`http://127.0.0.1:5000/`. When you subscribe to
the above URL on your favourite web browser, you'll land on setup page. This
indicates that MICAS installation was successful and you are ready to do
science.

## 3.1. MICAS Setup

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
alerting information. You have an option to provide your phone number or email
address as the means for MICAS to convey alerts. Email is the default mode
of communication and hence is required during alert set up. There is also
a possibility to add more alering sequences in this component, which will
be monitored during the MinION run.

**3. Configuration**  
Finally, in the confiuration section, you have to choose the directory to which
MinION reads will be deposited so that MICAS can access it and analyze. You also
have to provide an empty directory where MICAS can store its database and other
temporary files.


## 3.2. MICAS Analysis

# 4. Example Workflow

# 5. Citation

# 6. Feedback and bug reports
