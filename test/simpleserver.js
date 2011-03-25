var rb = require('../src');
rb.callback("INFO", function(args)
{
	return rb.reply.bulk(['redis_version:0.0', 'redbrick_version:0.1']);
});

rb.callback('SET', function(args)
{
	return rb.reply.statuscode('OK');
});

rb.start({'debug':true});