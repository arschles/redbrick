var net = require('net');
var reply = require('reply');
var replytypes = require('replytypes');
this.reply = reply;

VERSION = 0.1

/**
dictionary that has mappings from redis command to callback.
values of this dictionary look like this:
{
    'fn': callback function
    'style': way to call this function. only supported option is 'entire' right now. in future, we'll support 'streaming'
}
*/
callbacks = {
};

exports.callback = function(cmd, cb, style)
{
    if(typeof cb == 'undefined')
    {
        if(cmd in callbacks) return callbacks[cmd]['fn'];
        else return null;
    }
    else
    {
        style = typeof style == 'undefined' ? 'entire' : style;
        callbacks[cmd] = {'fn':cb, 'style':style};
    }
}

exports.start = function(opts)
{
    var host = 'host' in opts ? opts['host'] : 'localhost';
    var port = 'port' in opts ? opts['port'] : 1986;
    var debug = 'debug' in opts ? opts['debug'] : false;
    
    //debug logger. supports arrays for multi line debugging
    function dbg(s)
    {
        if(debug)
        {
            if(typeof s == "object") console.log("REDBRICK_DEBUG:\n" + s.join('\n') + '(END)');
            else console.log("REDBRICK_DEBUG: " + s);
        }
    }
    
    function default_callback(cmd, args)
    {
        var ret = reply.error(cmd + ' not implemented');
        return ret;
    }
    
    dbg("Redbrick initializing socket at " + host + ":" + port);
    
    net.createServer(function(socket)
    {
        socket.setEncoding('ascii');
    
        var buffer = "";    
    
        socket.on("data", function (data)
        {
            buffer += data;
        
            //TODO: fix this whole mess - it's slow as shit
        
            //see if the first CRLF is here
            if(buffer.indexOf('\r\n') != -1)
            {
                var split = buffer.split('\r\n');
                //remove the last element - it is always empty b/c all commands end with a CRLF
                split.pop();
            
                var numArgs = parseInt(split[0].substr(1), 10);
            
                //we're done reading this command if we have all the expected arguments
                if((split.length - 1) == (numArgs * 2))
                {
                    dbg(["starting response for request string:", buffer]);
                    var cmd = split[2];
                    var cmd_upper = cmd.toUpperCase();
                    var cmd_lower = cmd.toLowerCase();
                    var cb = default_callback;
                    
                    //special cases
                    if(cmd_lower == 'quit')
                    {
                        if('quit' in callbacks || 'QUIT' in callbacks)
                        {
                            callbacks['quit']
                        }
                        socket.write(reply.singleline('OK'));
                        socket.close();
                    }
                    
                    var args = [];
                
                    //args that are at indices divisible by 2 are the args, others are the length params
                    for(var i = 3; i < split.length; i++)
                    {
                        if(i % 2 == 0)
                        {
                            args.push(split[i]);
                        }
                    }
                    buffer = '';
                                        
                    if(cmd_upper in callbacks) cb = callbacks[cmd_upper]['fn'];
                    else if(cmd_lower in callbacks) cb = callbacks[cmd_lower]['fn'];
                    else if(cmd in callbacks) cb = callbacks[cmd](args)['fn'];
                    
                    dbg("command is " + cmd);
                    dbg("forwarding to " + cb.name);
                    
					var ret_data = null;
					
					if(
						(cmd in replytypes.functionmap) &&
						(typeof replytypes.functionmap[cmd] == "function")
					) { ret_data = replytypes.functionmap[cmd](cb(cmd, args)); }
					else { ret_data = cb(cmd, args); }
					
                    dbg(["writing to client:", ret_data]);
                    socket.write(ret_data);
                }
            
            }
        
        });
    
    }).listen(port, host);
}