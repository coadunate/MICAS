
import subprocess
from dataclasses import dataclass
from minknow_api.manager import Manager

@dataclass
class LinuxNotification():
    
    def __get_device(device, host="127.0.0.1", port=None):
        manager = Manager(host=host, port=port)
        for position in manager.flow_cell_positions():
            if position.name == device:
                return position
        raise ValueError("Could not find device {!r}".format(device))
    
    
    connection_address = __get_device("MN19220").connect()

    def test_connection(self, msg="This is a linux test connection"):
        self.send_notification(msg)
        pass

    def send_notification(self, msg):
        #Sends OS notification
        try:
            subprocess.Popen(['notify-send', msg])
        except:
            print("Error in linux notification: are you running MICAS on linux?")
        
        self.connection_address.log.send_user_message(severity=2, user_message=msg)
        print(self.connection_address.device.get_device_state())
        pass
