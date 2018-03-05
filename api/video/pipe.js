//var ss = req.query['aa'];
var ss =  3;
let space = {
	endpoint : 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/',
	video:'video.mp4',
	cache_folder: '/var/img/',
	type : 'img',
	ss : ''
}
//res.send(new Date());
//return true;
let CP = new pkg.crowdProcess();
let _f = {}, fn = ['s_1.mp4'];

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
			str += "file '" + space.cache_folder + 'M_' + i + ".mp4'\n";
		}
		pkg.fs.writeFile(space.cache_folder  + 'engine.data', str, function(err) {	    
			cbk1('WRITE_TXT:' + space.cache_folder  + 'engine.data');
		}); 
	};			       
	for (var i = 0; i < fn.length; i++) {
		_f1['P_' + i] = (function(i) {
			return function(cbk1) {
				let url = space.endpoint +  space.video + '/_s/' + fn[i];
				let file = pkg.fs.createWriteStream('/var/img/M_' + i + '.mp4');
				file.on('finish', function() {
					file.close(function() {
						cbk1(fn[i]);
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
	let cmd =  'cd ' + space.cache_folder  + ' && ffmpeg -i '  + fn[0] + ' -ss ' + ss + ' -vframes 1 -preset ultrafast ' + 
	    space.video + '_' + ss + '.png -y';
	pkg.exec(cmd, 
		function(error, stdout, stderr) {
			cbk(cmd);	
	});
};

CP.serial(_f,
	function(results) {
res.send(space.cache_folder  + space.video + '_' + ss + '.png);
return true;			
        	// res.writeHead(206, { 'Content-Type': 'video/mp4' });	
		var file = pkg.fs.createReadStream(space.cache_folder  + space.video + '_' + ss + '.png');
		file.pipe(res);
	}, 8000);
return true;

