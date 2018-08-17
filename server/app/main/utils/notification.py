# Send emails in Python, converted for Python 3.6 by iCrazyBlaze
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Your email details
fromaddr = "coadunateusask@gmail.com"
PASSWORD = "PASS_HERE"

def send_sms(alert_name,num_reads,email_address):
    """
        Sends a SMS message about the alerts to given phone_number.
    """
    print("Sent!")

def send_email(alert_name, num_reads,email_address):
    """
        Sends an email about the alerts to given email_address.
    """
    # Email message
    SUBJECT = "MICAS -- [ALERT] " + str(alert_name) + " was detected in your sample!"
    body = "Hi,\nMICAS has recently detected " + str(num_reads) + " reads of \
    " + str(alert_name)  + " in your sample. It probably needs your attention.\n\
    Thanks,\n- Your friends at MICAS"


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
