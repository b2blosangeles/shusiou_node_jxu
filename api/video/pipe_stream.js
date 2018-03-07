var CP = new pkg.crowdProcess();
var _f = {};
var buff = new Buffer(100);

let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_x/' + source_file + '/',
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com',  
    space_dir = '/shusiou/' + source_file + '/_s/';

let space = {
	endpoint : 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/',
	video:'video.mp4',
	cache_folder: '/tmp/shusiou_cache/video.mp4/'
};
var totalsize = 0;

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
_f['P_I1'] = function(cbk) {
	var v = CP.data.P_I0.x;

	CP1 = new pkg.crowdProcess();
	var _f1 = {};
	for (var i=0; i < v.length; i++) {
		_f1[v[i]] = (function(i) {
			return function(cbk1) {
				pkg.fs.stat(space.cache_folder + v[i], 
					function (err, stat) {
						if (err) { 
							cbk1(false); 
						} else {
							totalsize+=stat.size;
							cbk1(stat.size);
						}
					});
					
			}
			
		})(i);	
	}	
	CP1.parallel(
		_f1,
		function(results) {
			cbk(results.results);
	}, 10000);
	
};
CP.serial(
	_f,
	function(results) {
		//res.send({totalsize:totalsize, list:CP.data.P_I1});
		//return true;
		var cfg = CP.data.P_I0;
	//	let stream = require("stream"),
	//	a = new stream.PassThrough();
	//	a.pipe(res);
		
		var range = req.headers.range;
		/*
		if (req.param('start')) {
			var start = req.param('start'), end = req.param('end'), maxChunk = cfg.trunksize, total = totalsize;
		} else {
			if (!start) {
				var start = 0, end = 0, maxChunk = cfg.trunksize, total = totalsize;
			}
			if (range) {
			//	var total = cfg.filesize; 
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

		//res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
		 //   'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });			
		
		let start = 0, end=0, ffn = '';
		for (var o in CP.data.P_I1) {
			end = CP.data.P_I1[o];
			cnt += end;
			break;
			if (cnt < start) {
				ffn = space.cache_folder + o;
			} else {
				break;
			}
		}
		*/
		let ffn = space.cache_folder + 's_0.mp4';
		let start = 0;
		//res.send({'Content-Range': 'bytes ' + start + '-' + (CP.data.P_I1['s_0.mp4']-1) + '/' + totalsize, 
		//	'Accept-Ranges': 'bytes', 'Content-Length': CP.data.P_I1['s_0.mp4'], 'Content-Type': 'video/mp4' });
		// return true;
		var file = pkg.fs.createReadStream(ffn, {start:0, end:CP.data.P_I1['s_0.mp4']});
		/*
		res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + (CP.data.P_I1['s_0.mp4']-1) + '/' + total, 
			'Accept-Ranges': 'bytes', 'Content-Length': CP.data.P_I1['s_0.mp4'], 'Content-Type': 'video/mp4' });
		*/
		res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + (CP.data.P_I1['s_0.mp4']-1) + '/' + totalsize, 
			'Accept-Ranges': 'bytes', 'Content-Length': CP.data.P_I1['s_0.mp4'], 'Content-Type': 'video/mp4' });		
	       file.pipe(res);	
	},
	300000
);
return true;

