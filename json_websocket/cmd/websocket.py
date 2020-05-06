from .abstract_cmd_json_socket import AbstractCmdJsonWebsocket
from ..basic.websocket import realize_abstract_websocket


def realize_abstract_cmd_websocket(*args, **kwargs):
    asbws = realize_abstract_websocket(AbstractCmdJsonWebsocket, *args, **kwargs)

    #asbws.send_cmd_message=send_cmd_message

    return asbws


websocket_CmdJsonWebsocket = lambda *args,**kwargs:realize_abstract_cmd_websocket(*args,**kwargs)