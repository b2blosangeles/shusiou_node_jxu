let CP = new pkg.crowdProcess();
let _f = {}, fn = ['s_1.mp4']; 
let dirn = '/var/img/';

_f['WRITE_TXT'] = function(cbk) {
	var str = '';
	for (var i = 0; i < fn.length; i++) {
		str += "file '" + dirn + 'M_' + i + ".mp4'\n";
	}
	pkg.fs.writeFile(dirn + 'engine.data', str, function(err) {	    
		cbk('WRITE_TXT:' + dirn + 'engine.data');
	}); 
};
_f['PULLING'] = function(cbk) {;
	var CP1 = new pkg.crowdProcess();
	var _f1 = {}; 
	for (var i = 0; i < fn.length; i++) {
		_f1['P_' + i] = (function(i) {
			return function(cbk1) {
				let url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/video.mp4/_s/' + fn[i];
				let file = pkg.fs.createWriteStream('/var/img/M_' + i + '.mp4');
				file.on('finish', function() {
					file.close(function() {
						cbk1(fn[i]);
						return true;
						let cmd = 'cd ' + dirn + ' && ffmpeg -i M_' + i + '.mp4 ' +
						    ' -c copy -bsf:v h264_mp4toannexb -f mpegts  M_' + i + '.ts -y ' +
						    ' && rm M_' + i + '.mp4';
						pkg.exec(cmd, 
							function(error, stdout, stderr) {
								cbk1(fn[i]);
						});
					});  
				});
				pkg.request(url, function (error, response, body) {
				}).pipe(file);	
			}
		})(i);	
	}
	CP1.parallel(
	_f1,
	function(results) {
		cbk(results);
	}, 6000);
}

_f['FFMPEG'] = function(cbk) {
	let cmd = 'cd ' + dirn + ' && ffmpeg -f concat -safe 0 -i ' + dirn + 'engine.data -codec copy cache.mp4 -y';
	pkg.exec(cmd, 
		function(error, stdout, stderr) {
			cbk(cmd);	
	});
};

CP.serial(_f,
	function(results) {
		var file = pkg.fs.createReadStream('/var/img/cache.mp4');
		file.pipe(res);
		//var file = pkg.fs.createReadStream('/var/img/video.mp4');
		//file.pipe(res);	
	
	//	res.sendFile('/var/img/cache.mp4');
	}, 8000);
return true;

