var fn = '/tmp/video_a.mp4';

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
