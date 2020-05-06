import asyncio

import websockets

DEFAULT_PORT = 5942


class SendQue(list):
    async def __aiter__(self):
        try:
            while True:
                yield await None
        except:
            pass


class AsyncWebsocketServer():
    def __init__(self, host="127.0.0.1", port=DEFAULT_PORT, auto_connect=False):
        self.users = set()
        self.host = host
        self.port = port
        self.open =False
        if auto_connect:
            self.open_websocket()

    async def _register(self, websocket):
        websocket.send_que = SendQue()
        self.users.add(websocket)

    async def _unregister(self, websocket):
        self.users.remove(websocket)

    async def _websocket_worker(self, websocket, path):
        await self._register(websocket)
        try:
            async for message in websocket:
                await self._on_message(message, source=websocket)
        finally:
            await self._unregister(websocket)


    def open_websocket(self, host=None, port=None, return_awaitable=False):
        if port is None:
            port = self.port
        if host is None:
            host = self.host
        self.host = host
        self.port = port
        self.serve = websockets.serve(self._websocket_worker, self.host, self.port)
        asyncio.get_event_loop().run_until_complete(self.serve)
        self.open = True
        if return_awaitable:
            return self._run_forever()
        asyncio.get_event_loop().run_until_complete(self._run_forever())

    def close(self):
        self.open=False

    async def _on_message(self, data, source):
        print("<", data, "<<", source)

    async def _run_forever(self):
        while self.open:
            await asyncio.sleep(0.1)
        self.serve.ws_server.close()
        await self.serve.ws_server.wait_closed()



WebsocketServer = AsyncWebsocketServer

if __name__ == '__main__':
    AsyncWebsocketServer(auto_connect=True)