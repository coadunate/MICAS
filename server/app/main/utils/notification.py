# Send emails in Python, converted for Python 3.6 by iCrazyBlaze
import json
import os
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

email_config_path = os.path.join(os.path.dirname(os.path.abspath('~/')), 'server/app/config/email_config.json')

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

    # Email message
    SUBJECT = "MICAS -- [ALERT] " + str(query_name) + " was detected in your sample!"
    body = "Hi,\n\nMICAS has recently detected " + str(query_value) + "% of " + str(query_name) + "in your sample. It " \
                                                                                                "probably needs your " \
                                                                                                "attention.\n\n" \
                                                                                                "Thanks," \
                                                                                                "\nYour friends at " \
                                                                                                "MICAS"

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
        logger.debug("Email sent to '" + email_address + "' successfully!")
    except Exception as error:
        logger.error("An error occurred! The email configuration mustn't have been set \
        properly")
        logger.error(error)
