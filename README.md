Redbrick
============

Redbrick lets you build Redis protocol compatible servers in node.js

Example
===============

Here is a simple server that supports the INFO, SET and no other commands (by default, redbrick makes all other commands errors):

    var rb = require('redbrick');
    rb.callback("INFO", function(args)
    {
        //make sure you always return a redis_version key. some client libs require it
    	return rb.reply.bulk(['redis_version:0.0', 'redbrick_version:0.1']);
    });

    rb.callback('SET', function(args)
    {
        //basically a noop
    	return rb.reply.statuscode('OK');
    });

    rb.start({'debug':true});
    
TODOs
===============
- automatically know (based on cmd) what reply type is expected, and "cast" callback response into that reply
    - need to document what each callback needs to return (ie: array for bulk and multi-bulk, etc...)
- support for passing an object into the callback function - just try to call the function that matches the cmd name
    - lookup first in callback dictionary, then in objects (in order they were added) - this enables overrides
- set up jsunit for test suite
- rewrite parser to use state machine instead of current inefficient way
- handle special cases like "QUIT", which don't make sense to allow callbacks for
- create some pre-packaged callback objects
    - trivial redis pass through
    - 100% in memory redis
    - redis proxy w/ zookeeper for key lookups
    - load balancer for resque
- make sure modules are namespaced correctly
- implement streaming callbacks
    - look into using generators for implementing
- get working with JS redis client (DONE)