var file = pkg.fs.createReadStream('/var/img/video.mp4');
file.pipe(res);
