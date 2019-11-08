let extend_cmd = function (socket_class) {
    let oldProto = socket_class;
    class new_socket_class extends oldProto{
        constructor(name,url){
            super(name,url);
            this.cmd_functions = {};
            this.add_type_funcion('cmd', this.parse_socket_command.bind(this));
        }

        parse_socket_command(data) {
            var cmd = data.data;
            logger.debug('Command:', cmd);
            if(typeof this.cmd_functions[cmd.cmd] !== "undefined"){
                this.cmd_functions[cmd.cmd](cmd.data);
            }
            else logger.warn('Unknown command:',cmd.cmd);
        }

        cmd_message(cmd, data={}){
            this.type_message("cmd",{cmd:cmd,data:data})
        }

        add_cmd_funcion(name,callback){
            this.cmd_functions[name]=callback;
        }
    }
    return new_socket_class
};

JsonWebsocket = extend_cmd(JsonWebsocket);