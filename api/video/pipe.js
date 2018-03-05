function cache_request(url, fn, cbk) {
	var fn_temp = '/tmp/' + url.replace(/\//ig, '_').replace(':','_');
	pkg.fs.stat(fn_temp, function(error, stats) {
		if (error) {
			let file = pkg.fs.createWriteStream(fn_temp);
			file.on('finish', function() {
				file.close(function() {
					pkg.fs.copyFile( fn_temp, fn, (err) => {
						cbk(true);
					});
				});  
			});
			pkg.request(url, function (error, response, body) {
			}).pipe(file);			
		} else {
			pkg.fs.copyFile( fn_temp, fn, (err) => {
				cbk(true);
			});
		}
	});
}
function cache_ffmpeg(cmd, fn, cbk) {
	pkg.fs.stat(fn, function(err, stats) {
		if (err || !err) {
			pkg.exec(cmd, 
				function(error, stdout, stderr) {
					cbk(cmd);	
			});
		} else {
			cbk(cmd);
		}
	});	
}

if (isNaN(req.query['ss'])) {
	res.send('Wrong ss');
	return true;
}
var ss = req.query['ss'], sec = Math.floor(parseInt(ss) / 5), start_point = 5 - parseInt(ss) % 5;
let space = {
	endpoint : 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/',
	video:'video.mp4',
	cache_folder: '/var/img/',
	type : 'img',
	ss : ''
}
let CP = new pkg.crowdProcess();
let _f = {}, fn = []; 
  
for (var i = 0; i < sec; i++) {
	fn.push('s_' + sec[i] + '.mp4')
}

_f['CREATE_DIR'] = function(cbk) {
	var folderP = require(env.site_path + '/api/inc/folderP/folderP');
	var fp = new folderP();		
	fp.build(space.cache_folder, () => {
		cbk(true)
	});	
};

_f['PULLING'] = function(cbk) {;
	var CP1 = new pkg.crowdProcess();
	var _f1 = {}; 
			       
			       
	_f1['WRITE_TXT'] = function(cbk1) {
		var str = '';
		for (var i = 0; i < fn.length; i++) {
			str += "file '" + space.cache_folder + fn[i] + "'\n";
		}
		pkg.fs.writeFile(space.cache_folder  + 'engine.data', str, function(err) {	    
			cbk1('WRITE_TXT:' + space.cache_folder  + 'engine.data');
		}); 
	};			       
	for (var i = 0; i < fn.length; i++) {
		_f1['P_' + i] = (function(i) {
			return function(cbk1) {
				let url = space.endpoint +  space.video + '/_s/' + fn[i];
				cache_request(url, space.cache_folder + fn[i], cbk1);
				/*
				let file = pkg.fs.createWriteStream(space.cache_folder + fn[i]);
				file.on('finish', function() {
					file.close(function() {
						cbk1(fn[i]);
					});  
				});
				pkg.request(url, function (error, response, body) {
				}).pipe(file);
				*/
			}
		})(i);	
	}
	CP1.parallel(
	_f1,
	function(results) {
		cbk(results);
	}, 6000);
}
/*

_f['FFMPEG'] = function(cbk) {
	let cmd = 'cd ' + space.cache_folder  + 
	    ' && ffmpeg -f concat -safe 0 -i ' + space.cache_folder  + 'engine.data -c copy cache.mp4 -y';
	pkg.exec(cmd, 
		function(error, stdout, stderr) {
			cbk(cmd);	
	});
};

_f['FFMPEG_SECTION'] = function(cbk) {
	let cmd = 'cd ' +space.cache_folder  + ' && ffmpeg -ss 00:00:01 -i cache.mp4 -ss 00:00:01 -t 00:00:07  -c copy -y out121.mp4';
	pkg.exec(cmd, 
		function(error, stdout, stderr) {
			cbk(cmd);	
	});
};
*/
_f['FFMPEG_IMG'] = function(cbk) {
	let cmd =  'cd ' + space.cache_folder  + ' && ffmpeg -i '  + fn[0] + ' -ss ' + start_point + ' -vframes 1 -preset ultrafast ' + 
	    space.video + '_' + ss + '.png -y';
	cache_ffmpeg(cmd, space.video + '_' + ss + '.png', cbk);
};

CP.serial(_f,
	function(results) {			
      //  	res.writeHead(206, { 'Content-Type': 'video/mp4' });	
		var file = pkg.fs.createReadStream(space.cache_folder  + space.video + '_' + ss + '.png');
		file.pipe(res);
	}, 8000);
return true;
