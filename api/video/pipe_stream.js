var CP = new pkg.crowdProcess();
var _f = {};
var buff = new Buffer(100);

let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_x/' + source_file + '/',
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com',  
    space_dir = '/shusiou/' + source_file + '/_t/';

var CP = new pkg.crowdProcess();
var _f = {}; 

_f['P_I0'] = function(cbk) { 
	pkg.request(space_url +  space_dir + '_info.txt', 
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
		var cfg = CP.data.P_I0;
		let stream = require("stream"),
		a = new stream.PassThrough();
		a.pipe(res);
		
		var fn = [];
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
			fn.push(cfg.x[i]);	
		}
		res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
		    'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });			
		
		var CP1 = new pkg.crowdProcess();
		var _f1 = {}; 
		
		for (var i = 0; i < fn.length; i++) {
			_f1['P_' + i] = (function(i) {
				return function(cbk1) {
					let d = Buffer.from('');
					pkg.request(space_url + space_dir + fn[i], 
					function (error, response, body) {})
					.on('data', function(data) {
						// d = Buffer.concat([d, Buffer.from(data)]);
						a.write(Buffer.from(data));
					}).on('end', function() {
						cbk1(d);
					});
				}
			})(i);	
		}

		CP1.parallel(
			_f1,
			function(data) {
				for (var i = 0; i < fn.length; i++) {
				//	a.write(CP1.data['P_' + i]);
				}	
				a.end();
			},
			6000
		);
		
	},
	300000
);
return true;
