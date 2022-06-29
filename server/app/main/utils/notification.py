# Send emails in Python, converted for Python 3.6 by iCrazyBlaze
import json
import os
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

email_config_path = 'server/app/email_config.json'

logger = logging.getLogger()

email_data = None

try:
    with open(email_config_path) as json_email_file:
        email_data = json.load(json_email_file)
except:
    logger.warning("Email configuration not set")

def send_email(query, email_address):
    """
    Send email about query alerts to specified email
    @param query: the query information to send with the email
    @param email_address: the email to send the query alert to
    """

    query_name = query["name"]
    query_value = query["current_value"]
    query_threshold = query["threshold"]

    # Email message
    SUBJECT = "MICAS -- [ALERT] " + str(query_name) + " was detected in your sample!"
    body = f"Greetings,\n\nMICAS has detected the presence of {str(query_name)} at a frequency (out of the total reads) of " \
         + f"{float(query_value):.4f}. The threshold for {str(query_name)} was set to {float(query_threshold):.2f}.\n\nThanks,\nYour friends at MICAS"

    try:
        msg = MIMEMultipart()
        msg['From'] = email_data['from_email']
        msg['To'] = email_address
        msg['Subject'] = SUBJECT
        logger.debug(f"MESSAGE: \n{body}\nFrom: {msg['From']}\nTo: {msg['To']}\nPassword: {email_data['password']}")
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(host=email_data['email_server'], port=587)
        server.starttls()
        server.login(email_data['from_email'], email_data['password'])
        text = msg.as_string()
        server.sendmail(email_data['from_email'], msg['To'], text)
        server.quit()
        logger.debug(f"Email sent to '{msg['To']}' successfully regarding the presence of {str(query_name)} at {str(query_value)}!")
    except Exception as error:
        logger.error("An error occurred in sending an email! Check configuration file.")
        logger.error(error)
