from .abstract_cmd_json_socket import AbstractCmdJsonWebsocket
from ..basic.websocket import websocket_JsonWebsocket


class websocket_CmdJsonWebsocket(AbstractCmdJsonWebsocket, websocket_JsonWebsocket):
    def __init__(
        self,
        url,
        header=None,
        on_ping=None,
        on_pong=None,
        on_cont_message=None,
        keep_running=True,
        get_mask_key=None,
        cookie=None,
        subprotocols=None,
        on_data=None,
        reconnect_time=5,
            use_asyncio=False
    ):
        websocket_JsonWebsocket.__init__(
            self,
            url=url,
            header=header,
            on_ping=on_ping,
            on_pong=on_pong,
            on_cont_message=on_cont_message,
            keep_running=keep_running,
            get_mask_key=get_mask_key,
            cookie=cookie,
            subprotocols=subprotocols,
            on_data=on_data,
            reconnect_time=reconnect_time,
            use_asyncio=use_asyncio
        )

        AbstractCmdJsonWebsocket.__init__(self)

    def send_cmd_message(self, cmd, **data):
        self.send(self.cmd_message(cmd, **data))
