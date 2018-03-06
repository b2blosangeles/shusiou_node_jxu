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
let CP = new pkg.crowdProcess();
let _f = {}, fn = []; 
  
_f['CREATE_DIR'] = function(cbk) {
	var folderP = require(env.site_path + '/api/inc/folderP/folderP');
	var fp = new folderP();		
	fp.build(space.cache_folder, () => {
		cbk(true)
	});	
};
/*
_f['FFMPEG_SECTION'] = function(cbk) {
	if (!sec_t) {
		cbk(false);
	} else {
		let cmd = 'cd ' + space.cache_folder + ' && ffmpeg -ss ' + d_s + 
		    ' -i cache_' + sec_s + '_' + sec_t + '.mp4  -t ' + t + ' -c copy sec_' + ss0 + '_' + t + '.mp4';
		cache_ffmpeg(cmd, space.cache_folder  + 'sec_' + ss0 + '_' + t + '.mp4', cbk);
	}
};
*/
CP.serial(_f,
	function(results) {			
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

