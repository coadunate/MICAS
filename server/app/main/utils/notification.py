
from abc import ABC, abstractmethod
from dataclasses import dataclass

"""
A abstract dataclass which allows the integration of custom notification systems.


"""
@dataclass
class Notification(ABC):
    connection_address_string: str

    @abstractmethod
    def test_connection(self, msg):
        pass

    @abstractmethod
    def send_notification(self):
        pass


    @staticmethod
    def __all_subclasses(self, cls):
        return set(cls.__subclasses__()).union(
            [s for c in cls.__subclasses__() for s in self.__all_subclasses(c)])

    @staticmethod
    def broadcast_notification(self, *args):
        subclass_implementations = self.__all_subclasses(self)
        for arg, imp in zip(args, list(subclass_implementations)):
            imp.send_notification(arg)
