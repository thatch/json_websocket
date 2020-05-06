
class Logger{
    constructor(old_logger) {
        if (!old_logger)
            old_logger=console
        this.old_logger=old_logger
        this.log_debug=false
        this.log_info=true
        this.log_error=true
        this.log_exception=true
        this.log_log=true
        this.log_warn=true
        this.traceback=false
    }
    _trace(){
        var err = new Error();
        var line = err.stack.split("\n")[2];
        return line
    }
    clear(){
        this.old_logger.clear()
    }
    count(){
        let mainArguments = [arguments.length];
        let old_traceback=this.traceback
        if(this.traceback) {
            mainArguments.push(this._trace())
            this.traceback=false
        }
        this.log(...mainArguments)
        this.traceback=old_traceback


    }
    assert(){
        let mainArguments = Array.prototype.slice.call(arguments);
        let old_traceback=this.traceback
        if(this.traceback) {
            mainArguments.push(this._trace())
            this.traceback=false
        }
        if(!mainArguments[0])
            this.error("AssertionFail",...mainArguments.slice(1))
        this.traceback=old_traceback
    }
    debug(){
        let mainArguments =arguments
        if(this.traceback){
            mainArguments = Array.prototype.slice.call(mainArguments);
            mainArguments.push(this._trace())
        }
        if (this.log_debug)
            this.old_logger.debug.apply(null,["DEBUG:",...mainArguments])
    }
    info(){
        let mainArguments =arguments
        if(this.traceback){
            mainArguments = Array.prototype.slice.call(mainArguments);
            mainArguments.push(this._trace())
        }
        if (this.log_info)
            this.old_logger.info.apply(null,["INFO:",...mainArguments])
    }
    error(){
        let mainArguments =arguments
        if(this.traceback){
            mainArguments = Array.prototype.slice.call(mainArguments);
            mainArguments.push(this._trace())
        }
        if (this.log_error)
            this.old_logger.error.apply(null,["ERROR:",...mainArguments])
    }
    exception(){
        let mainArguments =arguments
        if(this.traceback){
            mainArguments = Array.prototype.slice.call(mainArguments);
            mainArguments.push(this._trace())
        }
        if (this.log_exception)
            this.old_logger.exception.apply(null,["EXCEPTION:",...mainArguments])
    }
    log(){
        let mainArguments =arguments
        if(this.traceback){
            mainArguments = Array.prototype.slice.call(mainArguments);
            mainArguments.push(this._trace())
        }
        if (this.log_log)
            this.old_logger.log.apply(null,["LOG:",...mainArguments])
    }

    warn(){
        let mainArguments = arguments;
        if(this.traceback){
            mainArguments = Array.prototype.slice.call(mainArguments);
            mainArguments.push(this._trace())
        }
        if (this.log_warn)
            this.old_logger.warn.apply(null,["WARN:",...mainArguments])
    }
}

logger=new Logger();


if (typeof JsonWebsocket !== 'function') {
    function turnwebsocketbuttons(on) {
        if (on) {
            let eles = document.getElementsByClassName("websocket_actionbutton");
            for (let i = 0; i < eles.length; i++) {
                let element = eles[i];
                element.className = element.className.replace(/\bwebsocket_off\b/g, "");
            }
        } else {
            let eles = document.getElementsByClassName("websocket_actionbutton");
            for (let i = 0; i < eles.length; i++) {
                let element = eles[i];
                let name = "websocket_off";
                let arr = element.className.split(" ");
                if (arr.indexOf(name) === -1) {
                    element.className += " " + name;
                }
            }
        }
    }

    var JsonWebsocket = class {
        constructor(name, url) {
            this.url = url;
            this.ws = null;
            this.RECONNECT_TIME = 5000;
            this.on_connect_functions = [];
            this.on_disconnect_functions = [];
            this.type_functions = {};
            this.name = name;
            this.reconnect = true;
            this.ANSWER_TIMEOUT = 5000;
            this.add_type_function('ans', this.parse_answer.bind(this));

            this.answers_pending={};

            this.add_on_connect_function(function () {
                turnwebsocketbuttons(true)
            });
            this.add_on_disconnect_function(function () {
                turnwebsocketbuttons(false)
            });
            if (url)
                this.connect();
        }

        parse_answer(data) {
            var ans = data.data;
            if(this.answers_pending[ans.id] !== undefined){
                this.answers_pending[ans.id][ans.success?'resolve':'reject'](ans.data);
                delete this.answers_pending[ans.id]
            }
        }

        connect(url) {
            if (url)
                this.url = url;

            if (this.ws !== null)
                this.ws.close();
            if (this.reconnect_timer) {
                clearTimeout(this.reconnect_timer);
                this.reconnect_timer = null;
            }
            logger.debug("Connect to "+this.url)
            this.ws = new WebSocket(this.url);

            this.ws.onopen = this.onpen.bind(this);
            this.ws.onmessage = this.onmessage.bind(this);
            this.ws.onclose = this.onclose.bind(this);
            this.ws.onerror = this.onerror.bind(this);
        }

        onpen() {
            for (let i = 0; i < this.on_connect_functions.length; i++) {
                this.on_connect_functions[i]();
            }
        }

        onclose(e) {
            for (let i = 0; i < this.on_disconnect_functions.length; i++) {
                this.on_disconnect_functions[i]();
            }
            if (this.reconnect) {
                logger.info((this.name ? this.name : 'Socket') + ' is closed. Reconnect will be attempted in ' + (this.RECONNECT_TIME / 1000.0) + ' second.', e.reason);
                let t = this;
                this.reconnect_timer = setTimeout(function () {
                    t.connect(t.url);
                }, this.RECONNECT_TIME);
            }
        }

        onerror(err) {
            logger.error('Socket encountered error: ', err.message, 'Closing socket');
            this.ws.close();
        }

        onmessage(e) {
            try {
                let data = JSON.parse(e.data.replace(/\bNaN\b/g, "null"));
                logger.debug("message",data)
                if (typeof this.type_functions[data.type] !== "undefined")
                    this.type_functions[data.type](data);
                else logger.warn('Unknown command type:', data.type, data);
            } catch (err) {
                logger.debug('Message:', e.data);
                logger.debug(err);
            }
        }

        send(data) {
            logger.debug(data);
            this.ws.send(data)
        }

        add_on_connect_function(callback) {
            callback = callback.bind(this);
            this.on_connect_functions.push(callback);
        }

        add_on_disconnect_function(callback) {
            callback = callback.bind(this);
            this.on_disconnect_functions.push(callback);
        }


        add_type_function(name, callback) {
            this.type_functions[name] = callback;
        }

        close() {
            this.reconnect = false;
            this.ws.close();
        }

        type_message(type, data,options={}) {
            options.expect_response = options.expect_response !== undefined ? options.expect_response : true
            options.timeout =  options.timeout !== undefined ? options.timeout : -1;
            options.resends = options.resends !== undefined ? options.resends : 0;

            let obj = {type: type, data: data}
            if(options.target !== undefined)
                obj.target=options.target

            if(options.expect_response)
                obj.id=Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)+Date.now();
            let objstr = JSON.stringify(obj);

            let resolve_prom, reject_prom;
            let isPending = true;
            let isRejected = false;
            let isFulfilled = false;

            let prom = new Promise(function (resolve, reject) {
                resolve_prom = function (ans){
                    resolve(ans);
                }
                reject_prom = function(error){
                    reject(error);
                }
            });

            let secprom = prom.then(function(v) {
                    isFulfilled = true;
                    isPending = false;
                    return v;
                },
                function(e) {
                    isRejected = true;
                    isPending = false;
                    throw e;
                });

            let send = function (){
                this.send(objstr);
                if(options.expect_response) {
                    setTimeout(function () {
                        if (options.resends > 0 && isPending) {
                            options.resends--;
                            send();
                        } else {
                            if (isPending) {
                                reject_prom("timeout");
                            }
                        }
                    }.bind(this), (options.timeout < 0) ? this.ANSWER_TIMEOUT : options.timeout);
                }
            }.bind(this)



            if(options.expect_response) {
                this.answers_pending[obj.id]={
                    resolve:resolve_prom,
                    reject:reject_prom
                }
            }else{
                setTimeout(function () {
                    resolve_prom({})
                },10)
            }
            send();
            return secprom
        }
    };
}