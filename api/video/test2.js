var total = 1024*1024;
/*
if ((req.headers) && (req.headers.range)) {
        res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + (total-1) + '/' + total, 
         'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
} 
*/
var file = pkg.fs.createReadStream('/var/img/cache.mp4');
file.pipe(res);
