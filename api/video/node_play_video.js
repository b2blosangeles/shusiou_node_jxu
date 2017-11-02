if (!req.query['vid']) {
	res.send('vid error ');
	return true;
}
var fn = '/tmp/video_'+req.query['vid']+'.mp4';

function streamVideo() {
      var total = data.size;
      var range = req.headers.range;
      if (range) {
		var parts = range.replace(/bytes=/, "").split("-");
		var partialstart = parts[0]; var partialend;
		  partialend =  parts[1];
		var start = parseInt(partialstart, 10);
		var end = partialend ? parseInt(partialend, 10) : total-1;
		var chunksize = (end-start)+1;
		var file = pkg.fs.createReadStream(fn, {start:start, end:end});

		res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
			'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
	       file.pipe(res);
	} else {
		res.send('Need streaming player');
	}
}


pkg.fs.stat(fn, function(err, data) {
    if (err) {
      res.send('Video does not exist');
    } else {
	 streamVideo()
	}
});


var request = require(env.root_path + '/package/request/node_modules/request');
var file = pkg.fs.createWriteStream('/tmp/video_a.mp4');
var http = require('http');
var tm =  new Date().getTime();
var request = http.get('http://shusiou.com/api/video/test_pipe.api?vid='+req.query['vid'], function(response) {
	response.pipe(file);
	response.on('end', function() {
		pkg.fs.stat(fn, function(err, data) {
		    if (err) {
		      res.send('Video does not exist');
		    } else {
			      var total = data.size;
			      var range = req.headers.range;
			      if (range) {
					var parts = range.replace(/bytes=/, "").split("-");
					var partialstart = parts[0]; var partialend;
					  partialend =  parts[1];
					var start = parseInt(partialstart, 10);
					var end = partialend ? parseInt(partialend, 10) : total-1;
					var chunksize = (end-start)+1;
					var file = pkg.fs.createReadStream(fn, {start:start, end:end});

					res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
						'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
				       file.pipe(res);
				} else {
					res.send('Need streaming player');
				}
			}
		});
	});
});


