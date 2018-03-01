var total = 1024*1024;
var range = req.headers.range;
if (range) {
        res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + (total-1) + '/' + total, 
         'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
}                              
var file = pkg.fs.createReadStream('/var/img/video.mp4', {start:0, end:1024*1024});
file.pipe(res);
