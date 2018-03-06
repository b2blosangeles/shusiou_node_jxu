function cache_request(url, fn, cbk) {
	pkg.fs.stat(fn, function(err0, stats) {
		if (err0) {
			let file = pkg.fs.createWriteStream(fn);
			file.on('finish', function() {
				file.close(function() {
					cbk(true);
				});  
			});
			pkg.request(url, function (err1, response, body) {
			}).pipe(file);			
		} else {
			cbk(true);
		}
	});
}
function cache_ffmpeg(cmd, fn, cbk) {
	pkg.fs.stat(fn, function(err, stats) {
		if (err) {
			pkg.exec(cmd, 
				function(error, stdout, stderr) {
					cbk(cmd);	
			});
		} else {
			cbk(cmd);
		}
	});	
}

let space = {
	endpoint : 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/',
	video:'video.mp4',
	cache_folder: '/tmp/shusiou_cache/video.mp4/'
}

let trunkSize = 1024 * 1024 * 1;

let CP = new pkg.crowdProcess();
let _f = {}, fn = []; 
  
_f['CREATE_DIR'] = function(cbk) {
	var folderP = require(env.site_path + '/api/inc/folderP/folderP');
	var fp = new folderP();		
	fp.build(space.cache_folder, () => {
		cbk(true)
	});	
};

_f['FFMPEG_SECTION'] = function(cbk) {
	let fn =  space.cache_folder + 's_0.mp4';
	pkg.fs.stat(fn, function(err, stat) {
		if (err) cbk('err.message');
		else {
			let buff = new Buffer(100);
			pkg.fs.open(fn, 'r', function(err, fd) {
				pkg.fs.read(fd, buff, 0, 100, 0, function(err, bytesRead, buffer) {
					
					if (err) cbk(err.message);
					else {
						var start = buffer.indexOf(new Buffer('mvhd')) + 17;
						var timeScale = buffer.readUInt32BE(start, 4);
						var duration = buffer.readUInt32BE(start + 4, 4);
						var movieLength = Math.floor(duration/timeScale);
						var v = {filesize:stat.size, start:start, time_scale:timeScale, trunksize: trunkSize,
							duration: duration, length:movieLength, x:[], status:0};
						cbk(v);
					}
				});
			});
		}
	});	
};

CP.serial(_f,
	function(results) {
		res.send(CP.data.FFMPEG_SECTION);
		return true;
		let url =  space.cache_folder + 's_0.mp4';
		pkg.fs.stat( url, function(err, stat) {
			if (err) { res.send(err.message); }
			else {
			      var total = stat.size;
			      var range = req.headers.range;
			      if (range) {
					var parts = range.replace(/bytes=/, "").split("-");
					var partialstart = parts[0]; var partialend;
					  partialend =  parts[1];
					var start = parseInt(partialstart, 10);
					var end = partialend ? parseInt(partialend, 10) : total-1;
					var chunksize = (end-start)+1;
					var maxChunk = 1024 * 1024; // 1MB at a time
					if (chunksize > maxChunk) {
					  end = start + maxChunk - 1;
					  chunksize = (end - start) + 1;
					}							      

					var file = pkg.fs.createReadStream(url, {start:start, end:end});
					res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
						'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
				       file.pipe(res);
				} else {
					var file = pkg.fs.createReadStream(url, {start:start, end:end});
					res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + total + '/' + total, 
						'Accept-Ranges': 'bytes', 'Content-Length': total, 'Content-Type': 'video/mp4' });
				       file.pipe(res);						
				}
			}
		});	

	}, 20000);
return true;

