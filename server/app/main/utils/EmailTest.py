import json
import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

email_config_path = 'server/app/email_config.json'
email_data = None

try:
    with open(email_config_path) as json_email_file:
        email_data = json.load(json_email_file)
except:
    print("failure")

email_address = "s.horovatin@usask.ca"
query_name = "Spaghetti"
query_value = "Grahams Number"
query_threshold = "-3"

SUBJECT = "MICAS -- [ALERT] " + str(query_name) + " was detected in your sample!"
body = f"Greetings,\n\nMICAS has detected the presence of {str(query_name)} at a frequency (out of the total reads) of " \
    + f"{query_value}. The threshold for {str(query_name)} was set to {float(query_threshold):.2f}.\n\nThanks,\nYour friends at MICAS"

msg = MIMEMultipart()
msg['From'] = email_data['from_email']
msg['To'] = email_address
msg['Subject'] = SUBJECT
print(f"MESSAGE: \n{body}\nFrom: {msg['From']}\nTo: {msg['To']}\nPassword: {email_data['password']}\n")
msg.attach(MIMEText(body, 'plain'))

context = ssl.create_default_context()
server = smtplib.SMTP(host='smtp.gmail.com', port=465)

server.starttls(context=context) 
server.login("dev.micas@gmail.com", "$w45fD*7akvJ")
text = msg.as_string()
server.sendmail(email_data['from_email'], msg['To'], text)
server.quit()
print(f"Email sent to '{msg['To']}' successfully regarding the presence of {str(query_name)} at {str(query_value)}!")

