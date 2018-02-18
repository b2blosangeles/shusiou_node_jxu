var CP = new pkg.crowdProcess();
var _f = {};
var buff = new Buffer(100);

let space_url = 'https://shusiou01.nyc3.digitaloceanspaces.com/',  
    source_path = '/var/img/',
    south_file = source_path + 'video.mp4',
    tmp_folder = '/var/img/x/',
    space_dir = 'shusiou/movies1/';

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
		res.writeHead(206, {'Content-Range': 'bytes 0-1048576/' + cfg.filesize, 
				    'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
		let stream = require("stream"),
		a = new stream.PassThrough();
		a.pipe(res);
		let d = Buffer.from('');
		pkg.request('https://shusiou01.nyc3.digitaloceanspaces.com/shusiou/movies1/aa', 
			function (error, response, body) {
		}).on('data', function(data) {
			// a.write(data);
			d = Buffer.concat([d,  Buffer.from(data)]);
		}).on('end', function() {
			a.write(d);
			a.end();;
		});		
		
		
	//	res.send(cfg);
	//	res.writeHead(206, {'Content-Range': 'bytes 0-1000000/100000000', 'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
	},
	300000
);
return true;

res.writeHead(206, {'Content-Range': 'bytes 0-1000000/100000000', 'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });

// res.writeHead(206, {'Content-Range': 'bytes 0-1000000/10000000', 
// 'Accept-Ranges': 'bytes', 'Content-Length': 10000000, 'Content-Type': 'video/mp4' });

let stream = require("stream"),
    a = new stream.PassThrough();
 a.pipe(res);	

var range = req.headers.range;

if (range) {
	var parts = range.replace(/bytes=/, "").split("-");
	var partialstart = parts[0]; var partialend;
	  partialend =  parts[1];
	var start = parseInt(partialstart, 10);
	if (start) {
		// a.write(Buffer.from('range--->' + start));
		res.send('range--->' + start);
		return true;	
	}
	var end = partialend ? parseInt(partialend, 10) : total-1;
	var chunksize = (end-start)+1;
	var maxChunk = 1024 * 1024; // 1MB at a time
	if (chunksize > maxChunk) {
	  end = start + maxChunk - 1;
	  chunksize = (end - start) + 1;
							}	

}

pkg.fs.readdir('/var/img/x/', (err, files) => {
	var f = [];
	files.forEach(file => {
		//if (/x([a-z]+)/.test(file)) 
		f[f.length] = file;
	});
	for (var i = 0; i < 27; i++) {
//	for (var i = 0; i < f.length; i++) {
		_f['P_' + i] = (function(i) { 
			return function(cbk) {
				let d = Buffer.from('');
				pkg.request('https://shusiou1.nyc3.digitaloceanspaces.com/'+ f[i], 
					function (error, response, body) {
				}).on('data', function(data) {
					// a.write(data);
					d = Buffer.concat([d,  Buffer.from(data)]);
				}).on('end', function() {
					cbk(d);
				});
			}
		})(i)
	}
	// CP.serial(
	CP.parallel(
		_f,
		function(data) {
						
			// for (var i = 0; i < f.length; i++) {
			for (var i = 0; i < 27; i++) {
				a.write(CP.data['P_' + i]);
			}	
			a.end();
		},
		30000
	);
})
return true;
