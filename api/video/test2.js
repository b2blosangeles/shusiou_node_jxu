var total = 1024*1024;
/*
if ((req.headers) && (req.headers.range)) {
        res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + (total-1) + '/' + total, 
         'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
} 
*/
// res.writeHead(200, { 'Content-Type': 'video/mp4' })
var file = pkg.fs.createReadStream('/var/img/yygg.mp4');
file.pipe(res);
// res.sendFile('/var/img/_s/video.mp4/s_80.mp4');
