import asyncio

import websockets

STARTPORT = 8700

class SendQue(list):
    async def __aiter__(self):
        try:
            while True:
                yield await None
        except:
            pass

class AsyncWebsocketServer():
    def __init__(self):
        self.users = set()
        self.host = None
        self.socketport = None
    async def register(self, websocket):
        websocket.send_que = SendQue()
        self.users.add(websocket)

    async def unregister(self, websocket):
        self.users.remove(websocket)

    async def websocket_worker(self, websocket, path):
        await self.register(websocket)
        try:
            async for message in websocket:
                await self.on_message(message, source=websocket)
        finally:
            await self.unregister(websocket)

    def open_websocket(self, host="localhost", port=None):
        if port is None:
            port = STARTPORT
        self.host = host
        self.socketport = port
        start_server = websockets.serve(self.websocket_worker, self.host, port)
        asyncio.get_event_loop().run_until_complete(start_server)

    async def on_message(self, data, source):
        print(f"< {data}")
