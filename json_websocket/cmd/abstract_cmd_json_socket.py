import json
from typing import Dict, Any

from ..basic.abstract_json_socket import MessageType, AbstractJsonWebsocket


def merge(new_values, default_values):
    nd = {}
    for key, value in default_values.items():
        nv = new_values.get(key,None)
        if isinstance(value, dict) and isinstance(nv,dict):
            nd[key] = merge(value, nv)
        else:
            if nv is None:
                nd[key] = value
            else:
                nd[key] = nv
    return nd


def run_cmd(consumer,cmd,data):
    consumer.available_cmds[cmd](consumer,**data)



MESSAGETYPES= {
    'cmd':MessageType(type='cmd',data_dict = {'cmd':None,'data':{}} ,decode_function=run_cmd)
}

class AbstractCmdJsonWebsocket(AbstractJsonWebsocket):
    message_types: Dict[str, MessageType]

    def __init__(self):
        super().__init__()
        self.available_cmds = {}

        for n,t in MESSAGETYPES.items():
            self.set_message_type(n,t)

    def set_cmd(self,cmd,func):
        self.available_cmds[cmd] = func
