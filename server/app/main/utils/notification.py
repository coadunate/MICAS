# Send emails in Python, converted for Python 3.6 by iCrazyBlaze
import smtplib, json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from twilio.rest import Client
import socketio
import os
sms_config_path = os.path.join(os.path.dirname(os.path.abspath('~/')),'server/app/config/sms_config.json')
email_config_path = os.path.join(os.path.dirname(os.path.abspath('~/')),'server/app/config/email_config.json')

import logging

logger = logging.getLogger(__name__)

twilio_data = None
try:
   with open(sms_config_path) as json_sms_file:
       twilio_data = json.load(json_sms_file)
except:
   logger.warning("Configuration not set")

email_data = None
try:
    with open(email_config_path) as json_email_file:
        email_data = json.load(json_email_file)
except:
    logger.warning("Configuration not set")

def send_sms(alert_name,num_reads,phone_number):
    """
        Sends a SMS message about the alerts to given phone_number.
    """
    client = Client(twilio_data['account_sid'], twilio_data['auth_token'])
    message = client.messages.create(
      body='[ALERT] ' + str(alert_name) + ' has been detected in your sample! \
      There were ' + str(num_reads) + ' found, which is above your set threshold and \
      therefore, we thought you probably want to take a look at the analysis.',
      from_=str(twilio_data['from_ph_number']),
      to=str(phone_number)
    )
    logger.info("Message sent successfully, SID: " + str(message.sid))

def send_email(alert_name, num_reads, email_address):
    """
        Sends an email about the alerts to given email_address.
    """
    # Email message
    SUBJECT = "MICAS -- [ALERT] " + str(alert_name) + " was detected in your sample!"
    body = "Hi,\nMICAS has recently detected " + str(num_reads) + " reads of \
    " + str(alert_name)  + " in your sample. It probably needs your attention.\n\
    Thanks,\nYour friends at MICAS"


    try:
        msg = MIMEMultipart()
        msg['From'] = email_data['from_email']
        msg['To'] = email_address
        msg['Subject'] = SUBJECT

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email_data['from_email'], email_data['password'])
        text = msg.as_string()
        server.sendmail(email_data['from_email'], email_address, text)
        server.quit()
        logger.info("Email sent to '" + email_address + "' successfully!")
    except Exception as error:
        logger.error("An error occurred! The email configuration mustn't have been set \
        properly")
        logger.error(error)
