import threading
import time

import websocket

from .abstract_json_socket import AbstractJsonWebsocket


class websocket_JsonWebsocket(AbstractJsonWebsocket,websocket.WebSocketApp):

    def __init__(self,url,header=None,
                 on_ping=None, on_pong=None,
                 on_cont_message=None,
                 keep_running=True, get_mask_key=None, cookie=None,
                 subprotocols=None,
                 on_data=None,reconnect_time=5):

        AbstractJsonWebsocket.__init__(self)
        websocket.WebSocketApp.__init__(self,
                                        url=url,
                                        header=header,
                                        on_open=self.on_open, on_message=self.on_message, on_error=self.on_error,
                                        on_close=self.on_close, on_ping=on_ping, on_pong=on_pong,
                                        on_cont_message=on_cont_message,
                                        keep_running=keep_running, get_mask_key=get_mask_key, cookie=cookie,
                                        subprotocols=subprotocols,
                                        on_data=on_data)
        self.reconnect_time = reconnect_time
        self.start_forever()


    def start(self):
        threading.Thread(target = self.run_forever,daemon=True).start()

    def start_forever(self):
        def _forever():
            while 1:
                self.run_forever()
                time.sleep(self.reconnect_time)
        threading.Thread(target = _forever,daemon=True).start()