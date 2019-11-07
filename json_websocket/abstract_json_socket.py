import json
from typing import Dict, Any


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


class MessageType():
    def __init__(self, type, data_dict=None,decode_function=None):
        self.decode_function = decode_function
        if data_dict is None:
            data_dict = {}
        self.data_dict = data_dict
        self.type = type

    def encode(self,**kwargs):
        return json.dumps({
            'type': self.type,
            'data': merge({**kwargs},self.data_dict),
        })

    def decode(self, consumer, data=None):
        if data is None:
            data = {}
        #try:
        self.decode_function(consumer=consumer,**data)
        #except:
        #    raise NotImplementedError(f"no decoder for {type}")

def run_cmd(consumer,cmd,data):
    consumer.available_cmds[cmd](consumer,**data)



MESSAGETYPES= {
    'error':MessageType(type='error'),
    'cmd':MessageType(type='cmd',data_dict = {'cmd':None,'data':{}} ,decode_function=run_cmd)
}

class AbstractJsonWebsocket():
    message_types: Dict[str, MessageType]

    def __init__(self):
        self.message_types = {}
        self.available_cmds = {}

        for n,t in MESSAGETYPES.items():
            self.set_message_type(n,t)


    def set_cmd(self,cmd,func):
        self.available_cmds[cmd] = func

    def set_message_type(self,name,message_type:MessageType):
        self.message_types[name] = message_type

    def on_open(self):
        print("open")

    def on_close(self, code=None, reason=None):
        print(code, reason)

    def on_error(self, e):
        print(e)

    def on_message(self, data):
        text_data = json.loads(data)
        self.message_types[text_data["type"]].decode(consumer=self,data=text_data["data"])
        #  message = text_data_json['message']

        # Send message to room group
        #async_to_sync(self.channel_layer.group_send)(
        #    self.group_name,
        #    {
        #        'type': 'chat_message',
        #        'message': text_data
        #    }
        #)
