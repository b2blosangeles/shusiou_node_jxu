function write404(msg) {
	res.writeHead(404);
	res.write(msg);
	res.end();	
}

var type= req.query['type'], vid = req.query['vid'], server = req.query['server'];
var patt = /([?&]server)=([^#&]*)/i;

if (!type || !vid || !server) {  write404('vid or type error '); return true; }

var url = 'http://'+ server + req.url.replace(patt, '');

//
var http = require('http');

var mnt_folder = '/var/shusiou-video/',  
    video_folder = mnt_folder  + 'videos/' + vid + '/', 
    file_video =  video_folder + 'video/video.mp4',
    folder_image = video_folder + 'images/',
    folder_section =   video_folder + 'sections/';

var folderP = require(env.site_path + '/api/inc/folderP/folderP');

switch(type) {
	case 'image':
		var w = req.query['w'], s = req.query['s'];
		if (!s || ['90', '180', '480', 'FULL'].indexOf(w) === -1) { write404('wrong s or w'); return true; }
		var fn = folder_image + w + '_' + s + '.png';

		var CP = new pkg.crowdProcess();
		var _f = {};

		_f['S0'] = function(cbk) { 
			pkg.fs.stat(mnt_folder, function (err, stats){
				if (err) { cbk({status:'failure', message:err.message});  CP.exit = 1; }
				else if (!stats.isDirectory()){ cbk({status:'failure', message:err.message});  CP.exit = 1; }
				else {
				      pkg.fs.stat(file_video, function(err, stat) {
					 if(err) { cbk({status:'failure', message:err.message});  CP.exit = 1; }
					 else cbk(true);
				      });
				}
			});
		};		
		
		_f['S1'] = function(cbk) { 
			var fp = new folderP();
			fp.build(folder_image, function() { cbk(true);});
		};

		_f['S2'] = function(cbk) {
			pkg.fs.stat(fn, function(err, stat) {
				if(!err) { cbk(fn);
				} else {
				//	var durl = 'http://'+req.query['host']+'/api/video/video_image.api?vid='+vid+'&s='+req.query['s']+'&w='+req.query['w'];
					 
					var request = http.get(url, function(response) {
						if (response.statusCode == 404 || response.statusCode == 500) {
							response.on('data', function(str) {
								res.writeHead(404);
								res.write('Stream does not exist or size too small::' + str);
								res.end();				
							});		
						} else {
							cbk(url + '=niu=' + fn + ' --- ' + folder_image);
							/*
							fp.build(folder_image, function() {
								var file = pkg.fs.createWriteStream(fn);
								response.pipe(file);
								response.on('end', function() {
									 if (req.query['type'] =='image') streamFile(req, res);
									else streamVideo(req, res);
								});
							});
							*/
						}	
					});					
					
				}
			});
		};		
		
		CP.serial(
			_f,
			function(data) {
				res.send(data);
				return true;
				if (CP.data.S0 !== true) {
					res.send('CP.data.S0');
					return true;
				}
				
				pkg.fs.stat(fn, function(err, data1) {
					if (err) {  res.send(url); }
					else {
						res.writeHead(200); 
						var file = pkg.fs.createReadStream(fn);
						file.pipe(res);
						setTimeout(
							function() {
								file.destroy();
								write404('timeout')
							}, 30000
						);						
					}
				});
			},
			30000
		);    
		break;
	case 'section':
		var l = req.query['l'], s = req.query['s'];
		if (!s || !l) { write404('wrong s or l'); return true; }
		var fn = folder_section + s + '_' + l + '.mp4';

		var CP = new pkg.crowdProcess();
		var _f = {};
		
		_f['S0'] = function(cbk) { 
			pkg.fs.stat(mnt_folder, function (err, stats){
				if (err) { cbk({status:'failure', message:err.message});  CP.exit = 1; }
				else if (!stats.isDirectory()){ cbk({status:'failure', message:err.message});  CP.exit = 1; }
				else {
				      pkg.fs.stat(file_video, function(err, stat) {
					 if(err) { cbk({status:'failure', message:err.message});  CP.exit = 1; }
					 else cbk(true);
				      });
				}
			});
		};		
		
		_f['S1'] = function(cbk) { 
			var fp = new folderP();
			fp.build(folder_section, function() { cbk(true);});
		};

		_f['S2'] = function(cbk) {

			pkg.fs.stat(fn, function(err, stat) {
				if(!err) { cbk(fn);
				} else {
					var childProcess = require('child_process');
					var ls = childProcess.exec('ffmpeg  -i ' + file_video + ' -ss '+ s + ' -t ' + l + ' -c copy ' + fn +' -y ', 		   
						function (error, stdout, stderr) {
							cbk(true);
						});
				}
			});
		};
		CP.serial(
			_f,
			function(data) {
				if (CP.data.S0 !== true) {
					res.send(CP.data.S0);
					return true;
				}				
				pkg.fs.stat(fn, function(err, data1) {
					if (err) {  write404(fn + ' does not exist'); }
					else {
					      var total = data1.size;
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
			},
			30000
		);    
		break;	
	case 'video':				
		pkg.fs.stat(file_video, function(err, data1) {
			if (err) {  write404(file_video + ' does not exist'); }
			else {
			      var total = data1.size;
			      var range = req.headers.range;
			      if (range) {
					var parts = range.replace(/bytes=/, "").split("-");
					var partialstart = parts[0]; var partialend;
					  partialend =  parts[1];
					var start = parseInt(partialstart, 10);
					var end = partialend ? parseInt(partialend, 10) : total-1;
					var chunksize = (end-start)+1;
					var file = pkg.fs.createReadStream(file_video, {start:start, end:end});
					res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
						'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
				       file.pipe(res);
				} else {
					res.send('Need streaming player');
				}
			}
		});
		break;			
	default:
		 write404('type error');  
}
