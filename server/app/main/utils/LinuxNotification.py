
import subprocess
from dataclasses import dataclass
from minknow_api.manager import Manager
import logging

logger = logging.getLogger('micas')

@dataclass
class LinuxNotification():
    
    def index_devices(host="127.0.0.1", port=None):
        device_index = []
        try:
            manager = Manager(host=host, port=port)
            device_index = [position for position in manager.flow_cell_positions()]
        except:
            pass
        return device_index
        

    def get_device(device_name, host="127.0.0.1", port=None):
        for device in LinuxNotification.index_devices(host, port):
            if device.name == device_name:
                logger.debug(f"Device type: {type(device)}")
                return device
        logger.error(f"Error: Could not find device {device}")    
        return None

    def test_connection( device_name, msg="This is a linux test connection"):
        LinuxNotification.send_notification(msg)
        pass

    def send_notification(device_name, msg, severity=2):
        #Sends OS notification

        if device_name != "":
            connection_address = LinuxNotification.get_device(device_name).connect()
            try:
                subprocess.Popen(['notify-send', msg])
                
                connection_address.log.send_user_message(severity=severity, user_message=msg)
                logger.debug(connection_address.device.get_device_state())
            
            except:
                logging.error("Error: unable to send linux notification, are you running MICAS on linux?")
        else:
            logger.error(f"Error: Could not find device \"{device_name}\"")
        pass
        

