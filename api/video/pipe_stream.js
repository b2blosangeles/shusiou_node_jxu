let source_file = (req.query['video_fn']) ?  req.query['video_fn'] : 'video.mp4',
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com', 
    space_info = '/shusiou/' + source_file + '/_info.txt',
    space_dir = '/shusiou/' + source_file + '/_t/';

var CP = new pkg.crowdProcess();
var _f = {}; 

_f['P_I0'] = function(cbk) { 
	pkg.request(  space_url + space_info, 
	function (err, res, body) {
		if (err) { 
			cbk(false); 
		} else {
			let v = {};
			try { 
				v = JSON.parse(body);
			} catch (e) { v = false; }
			cbk(v);
		}
	});		
};
CP.serial(
	_f,
	function(results) {
		let cfg = CP.data.P_I0,
		    stream = require("stream"),
		    a = new stream.PassThrough(),
		    fn = [];
		
		a.pipe(res);
		var range = req.headers.range;
		
		if (req.param('start')) {
			var start = req.param('start'), end = req.param('end'), maxChunk = cfg.trunksize, total = cfg.filesize;
		} else {
			if (!start) {
				var start = 0, end = 0, maxChunk = cfg.trunksize, total = cfg.filesize;
			}
			if (range) {
				var total = cfg.filesize; 
				var parts = range.replace(/bytes=/, "").split("-");
				var partialstart = parts[0]; var partialend;
				  partialend =  parts[1];
				var start = parseInt(partialstart, 10);
				var end = (partialend) ? parseInt(partialend, 10) : (total-1);
				var chunksize = (end-start)+1;
				if (chunksize > maxChunk) {
				  end = start + maxChunk - 1;
				  chunksize = (end - start) + 1;
				} 
			} 
		}
		var sidx = Math.floor(start / maxChunk); 
		var eidx = Math.min(Math.ceil(end / maxChunk), sidx+1); 
		start = sidx * maxChunk; end = eidx * maxChunk;
		for (var i = sidx; i < eidx; i++) {
			fn.push(cfg._t[i]);	
		}
		res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
		    'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });			
		
		var CP1 = new pkg.crowdProcess();
		var _f1 = {}; 
		
		for (var i = 0; i < fn.length; i++) {
			_f1['P_' + i] = (function(i) {
				return function(cbk1) {
					pkg.request(space_url + space_dir + fn[i], 
					function (error, response, body) {})
					.on('data', function(data) {
						a.write(Buffer.from(data));
					}).on('end', function() {
						cbk1(true);
					});
				}
			})(i);	
		}

		CP1.parallel(
			_f1,
			function(data) {	
				a.end();
			},
			6000
		);
		
	},
	10000
);
return true;
