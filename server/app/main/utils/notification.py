# Send emails in Python, converted for Python 3.6 by iCrazyBlaze
import smtplib, json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from twilio.rest import Client

import os
sms_config_path = os.path.join(os.path.dirname(os.path.abspath('~/')),'server/app/config/sms_config.json')

twilio_data = None
with open(sms_config_path) as json_data_file:
    twilio_data = json.load(json_data_file)

# Your email details
fromaddr = "coadunateusask@gmail.com"
PASSWORD = "PASS_HERE"

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
    print("Message sent successfully, SID: " + str(message.sid))

def send_email(alert_name, num_reads,email_address):
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
        msg['From'] = fromaddr
        msg['To'] = email_address
        msg['Subject'] = SUBJECT

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(fromaddr, PASSWORD)
        text = msg.as_string()
        server.sendmail(fromaddr, email_address, text)
        server.quit()
        print("Email sent to '" + email_address + "' successfully!")
    except Exception as error:
        print("An error occured! The email configuration mustn't have been set \
        properly")
        print(error)
