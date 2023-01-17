import socket
import logging

logger = logging.getLogger('micas')

def select_unused_port(pref_port: int) -> int:
    sock = socket.socket()
    free_port = pref_port
    try:
        sock.bind(('0.0.0.0', pref_port))
    except:
        sock.bind(('', 0))
        free_port = sock.getsockname()[1]
        logger.warning(f"Port {pref_port} on 0.0.0.0 already in use. Selected {free_port} instead")
    return free_port

def export_port(port: int, path: str = "") -> None:
    f = open('./frontend/app_url.txt', 'w')
    f.write(f"{path}{port}/")
    f.close()