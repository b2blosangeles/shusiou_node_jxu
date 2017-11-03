if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
if (isNaN(req.query['vid']) || !parseInt(req.query['vid'])) { res.send('wrong vid'); return true; }
if (!req.query['host']) { res.send('missing host'); return true; }
var channel = (req.query['channel'])?parseInt(req.query['channel']):0;

var vid = req.query['vid'];

var mnt_folder = '/var/shusiou-video/', 
    fn, fd, info_fn, info_fd, durl;

if (req.query['type'] =='video') {
    fd = mnt_folder + 'videos/' + vid + '/video/';
    info_fd = mnt_folder + 'info/' + vid + '/video/';
    fn = fd + 'video.mp4';
    info_fn = info_fd + 'video.json';
    durl = '';	
}

if (req.query['type'] =='section') {
    if (isNaN(req.query['s']) || !parseInt(req.query['s'])) { res.send('wrong s'); return true; }
    if (isNaN(req.query['l']) || !parseInt(req.query['l'])) { res.send('wrong l'); return true; }
    fd = mnt_folder + 'videos/' + vid + '/sections/';
    info_fd = mnt_folder + 'info/' + vid + '/sections/';    
    fn = fd+ req.query['s']+'_'+req.query['l']+'.mp4';
    info_fn = info_fd + req.query['s']+'_'+req.query['l'] + '.json'
    durl = 'http://'+req.query['host']+'/api/video/file_video_section.api?vid='+vid+'&s='+req.query['s']+'&l='+req.query['l'];	
}

if (req.query['type'] =='image') {
    if (['FULL', '90', '180', '480'].indexOf(req.query['w']) === -1) { res.send('wrong w'); return true; }
    if (isNaN(req.query['s']) || !parseInt(req.query['s'])) { res.send('wrong s'); return true; }
    fd = mnt_folder + 'videos/' + vid + '/images/';
    info_fd = mnt_folder + 'info/' + vid + '/images/';
    durl = 'http://'+req.query['host']+'/api/video/video_image.api?vid='+vid+'&s='+req.query['s']+'&w='+req.query['w'];			
    
    fn = fd+req.query['w']+'_'+req.query['s']+'.png';
    info_fn = info_fd +req.query['w']+'_'+req.query['s']+'.json'
}

var CP = new pkg.crowdProcess();
var folderP = require(env.site_path + '/api/inc/folderP/folderP');
var fp = new folderP();

var request = require(env.root_path + '/package/request/node_modules/request');
var http = require('http');

var _f = {};
_f['I0'] = function(cbk) { /* --- get catch info --- */
	pkg.fs.readFile(info_fn, 'utf-8', function (err, data){
		var pull_hub_info = function() {
			request.post({
				url: 'http://'+req.query['host']+'/api/video/hub_info.api',
				form:{ fn: fn.replace(mnt_folder,'') }, 
			}, function(error, response, body){
				var v = {};
				try { v = JSON.parse(body); } catch(e) { }
				fp.build(info_fd, function() {
					pkg.fs.writeFile(info_fn, JSON.stringify(v), function (err) {
						if (err) cbk({status:'error'});
						else cbk(v);
					});
				});				
			
				
			});		
		}
		if (err) { 
			pull_hub_info();	

		} else {
			var v = {};
			try { v = JSON.parse(data); } catch(e) { }
			pkg.fs.stat(info_fn, function(err, data_s) {
				if (v.status == 'success' && v.size > 0) {
					cbk(v);
				} else {
					var d = parseInt(new Date().getTime() * 0.001) - parseInt(data_s.ctimeMs * 0.001);
					if (d < 10) {
						cbk(v);
					} else {
						pull_hub_info();
					}
				}
			});
		}
	});
};

_f['I1'] = function (cbk) {
	if (CP.data.I0.status == 'success' && CP.data.I0.size > 0) {
		cbk(CP.data.I0.size);
	} else {
		cbk(false);
	}
};
function streamVideo(req, res) {
	pkg.fs.stat(fn, function(err, data) {
	    if (err) {
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.write('Stream does not exist');
		res.end();
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
}

function streamFile(req, res) {
	pkg.fs.stat(fn, function(err, data) {
	    if (err) {
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.write('Stream does not exist');
		res.end();
	    } else {	
		    var file = pkg.fs.createReadStream(fn);
		    file.pipe(res);
	    }
	});	
}
function pull_stream(req, res) {
	var request = http.get('http://'+req.query['host']+'/api/video/hub_pipe_stream.api?fn='+fn.replace(mnt_folder,''), function(response) {
		if (response.statusCode == 404 || response.statusCode == 500) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('Stream does not exist');
			res.end();		
		} else {
			fp.build(fd, function() {
				var file = pkg.fs.createWriteStream(fn);
				response.pipe(file);
				response.on('end', function() {
					 if (req.query['type'] =='image') streamFile(req, res);
					else streamVideo(req, res);
				});
			});
		}	
	});
}	

function direct_pull_stream(req, res) {
	if (!durl) {
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.write('Stream does not exist');
		res.end();		
	}	
	var request = http.get(durl, function(response) {
		if (response.statusCode == 404 || response.statusCode == 500) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('Stream does not exist');
			res.end();		
		} else {
			fp.build(fd, function() {
				var file = pkg.fs.createWriteStream(fn);
				response.pipe(file);
				response.on('end', function() {
					 if (req.query['type'] =='image') streamFile(req, res);
					else streamVideo(req, res);
				});
			});
		}	
	});
}

CP.serial(
	_f,
	function(data1) {
		pkg.fs.stat(fn, function(err, data) {
		    if (err) {
			 if (CP.data.I1 === false) {
				direct_pull_stream(req, res);				 
			 } else {
				pull_stream(req, res);
			 }
		    } else {
			 if (CP.data.I1 === false) {
				 CP.data.I1 = 1;
			 }
			 if (data.size < CP.data.I1) {	
				 var d = parseInt(new Date().getTime() * 0.001) - parseInt(data_s.ctimeMs * 0.001);
				 if (d > 120) {
					pkd.fs.unlink(fn, function(error) {
					   res.redirect(req.url.replace(/\&channel\=([0-9]+)/,'') + '&channel=' + (channel+1)); 
					});				 
				 } else {	 
					 if (channel > 15) {
						 res.send('Error! timeout');
					 } else {
						 setTimeout(function() {
							res.redirect(req.url.replace(/\&channel\=([0-9]+)/,'') + '&channel=' + (channel+1));
						 }, 3000 + Math.floor(Math.random() * (1000)));
					 }
				 }
			  } else {
				if (req.query['type'] =='image') streamFile(req, res);
				else streamVideo(req, res);
			  }
		    }
		});		
		
		
	},
	59000
);
