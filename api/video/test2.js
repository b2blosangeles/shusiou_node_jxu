var file = pkg.fs.createReadStream('/var/img/video.mp4', {start:0, end:1024*1024});
file.pipe(res);
