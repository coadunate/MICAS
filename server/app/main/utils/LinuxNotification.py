
import subprocess
from dataclasses import dataclass
from minknow_api.manager import Manager
import logging

logger = logging.getLogger('micas')

@dataclass
class LinuxNotification():
    device_name: str = ""

    def index_devices(host="127.0.0.1", port=None):
        device_index = []
        try:
            manager = Manager(host=host, port=port)
            device_index = [position for position in manager.flow_cell_positions()]
        except:
            pass
        return device_index
        

    def get_device(self, device_name, host="127.0.0.1", port=None):
        for device in self.__index_devices(host, port):
            if device == device_name:
                return device
        logger.error(f"Error: Could not find device {device}")    

    def test_connection(self, msg="This is a linux test connection"):
        self.send_notification(msg)
        pass

    def send_notification(self, msg):
        #Sends OS notification
        connection_address = self.__get_device(self.device_name).connect()
        try:
            subprocess.Popen(['notify-send', msg])
        except:
            logging.error("Error: unable to send linux notification, are you running MICAS on linux?")
        
        connection_address.log.send_user_message(severity=2, user_message=msg)
        logger.debug(self.connection_address.device.get_device_state())
        pass

print(LinuxNotification().index_devices())