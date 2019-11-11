if(!logger)
    var logger = console;

if(typeof JsonWebsocket !== 'function')
    function turnwebsocketbuttons(on) {
        if(on)
            $(".websocket_actionbutton").removeClass("websocket_off");
        else
            $(".websocket_actionbutton").addClass("websocket_off");
    }

    var JsonWebsocket = class{
        constructor(name,url){
            this.url=url;
            this.ws = null;
            this.RECONNECT_TIME = 10000;
            this.on_connect_functions = [];
            this.on_disconnect_functions = [];
            this.type_functions = {};
            this.name = name;
            this.reconnect = true;

            this.add_on_connect_function(function () {turnwebsocketbuttons(true)});
            this.add_on_disconnect_function(function () {turnwebsocketbuttons(false)});
            if(url)
                this.connect();
        }
        connect(url){
            if(url)
                this.url = url;

            if(this.ws!==null)
                this.ws.close();
            if(this.reconnect_timer){
                clearTimeout(this.reconnect_timer);
                this.reconnect_timer = null;
            }

            this.ws = new WebSocket(this.url);

            this.ws.onopen = this.onpen.bind(this);
            this.ws.onmessage = this.onmessage.bind(this);
            this.ws.onclose = this.onclose.bind(this);
            this.ws.onerror = this.onerror.bind(this);
        }
        onpen(){
            for(let i=0;i<this.on_connect_functions.length;i++) {
                this.on_connect_functions[i]();
            }
        }
        onclose(e){
            for(let i=0;i<this.on_disconnect_functions.length;i++) {
                this.on_disconnect_functions[i]();
            }
            if(this.reconnect) {
                logger.info((this.name ? this.name : 'Socket') + ' is closed. Reconnect will be attempted in ' + (this.RECONNECT_TIME / 1000.0) + ' second.', e.reason);
                let t = this;
                this.reconnect_timer = setTimeout(function () {
                    t.connect(t.url);
                }, this.RECONNECT_TIME);
            }
        }
        onerror(err){
            logger.error('Socket encountered error: ', err.message, 'Closing socket');
            this.ws.close();
        }
        onmessage(e){
            try {
                var data = JSON.parse(e.data.replace(/\bNaN\b/g, "null"));
                if(typeof this.type_functions[data.type] !== "undefined")
                    this.type_functions[data.type](data);
                else logger.warn('Unknown command type:', data.type, data);
            }catch(err) {
                logger.debug('Message:', e.data);
                logger.debug(err);
            }
        }
        send(data){
            logger.debug(data);
            this.ws.send(data)
        }

        add_on_connect_function(callback){
            callback = callback.bind(this);
            this.on_connect_functions.push(callback);
        }

        add_on_disconnect_function(callback){
            callback = callback.bind(this);
            this.on_disconnect_functions.push(callback);
        }



        add_type_funcion(name,callback){
            this.type_functions[name]=callback;
        }

        close(){
            this.reconnect = false;
            this.ws.close();
        }

        type_message(type,data){
            this.send(JSON.stringify({type:type,data:data}))
        }
    };