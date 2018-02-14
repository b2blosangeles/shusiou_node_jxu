var stream = require("stream")
var a = new stream.PassThrough();
a.pipe(res);
let g = pkg.request('https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?w=1260&h=750&auto=compress&cs=tinysrgb', 
	function (error, response, body) {
});
g.on('data', function(data) {
	a.write(new Buffer(data, 'binary'));
});
g.on('end', function(data) {
	a.end()
});
return true;

res.writeHead(200); 
var file = pkg.fs.createReadStream(fn);
file.pipe(res);
setTimeout(
  function() {
    file.destroy();
    write404('timeout')
  }, 30000
);	
return true;


var type= req.query['type'], vid = req.query['vid'], server = req.query['server'];
var patt = /([?&]server)=([^#&]*)/i;

if (!type || !vid || !server) {  write404('vid, type or server error '); return true; }

var url = 'http://'+ server + req.url.replace(patt, '');

var node_cache_only = (req.query['node_cache_only'])?true:false;
    
var mnt_folder = '/var/shusiou-video/',  
    video_folder = mnt_folder  + 'videos/' + vid + '/', 
    info_folder = mnt_folder  + 'info/' + vid + '/', 
    
    file_video =  video_folder + 'video/video.mp4',
    info_video =   info_folder + 'video/video.json',
    
    folder_image = video_folder + 'images/',
    info_image = info_folder + 'images/';

    folder_section =   video_folder + 'sections/',
    info_section =   info_folder + 'sections/';	

var folderP = require(env.site_path + '/api/inc/folderP/folderP');
var fp = new folderP(),
    http = require('http'),
    request = require(env.root_path + '/package/request/node_modules/request');

function IsMasterVideoReady(cbk, CP){
	if (node_cache_only) {
		cbk(true); return true;
	}
	pkg.fs.readFile(info_video, 'utf8', function(err, data) {
		var v = {};
		try { v = JSON.parse(data); } catch (e) {}; 
		if(!err) {
			pkg.fs.stat(file_video, function(err1, stat1) {
				if(!err1 && (v.size) && v.size == stat1.size) {
					cbk({status:'success', size:stat1.size});
				} else {
					cbk({status:'error', message:err1.message});
					CP.exit = 1;
				}
			});
			
		} else {
			cbk({status:'error', message:err.message});
			CP.exit = 1;
		}
	})
}


switch(type) {
	case 'image':
		var w = req.query['w'], s = req.query['s'];
		if (!s || ['90', '180', '480', 'FULL'].indexOf(w) === -1) { write404('wrong s or w'); return true; }
		var fn = folder_image + w + '_' + s + '.png',
		info_fn = info_image + req.query['w']+'_'+req.query['s']+'.json';

		var CP = new pkg.crowdProcess();
		var _f = {};
		
		_f['IsMasterVideoReady'] = function(cbk) { 
			 IsMasterVideoReady(cbk, CP);
		};		
		
		_f['S0'] = function(cbk) { 
			var fp = new folderP();
			fp.build(folder_image, function() { cbk(true);});
		};

		_f['V1'] = function(cbk) { 
			var pull_hub_info = function(url, fn, cbk) {
				request.post({
					url: url,
					form:{ fn: fn }, 
				}, function(error, response, body){
					if (error) {
						cbk({status:'failure', message:error.message}); CP.exit = 1;
					} else {	
						var v = {}; try { v = JSON.parse(body); } catch(e) { }
						if ((v.status !='success' || ! v.size)) {
							cbk({status:'failure', message:v.message}); CP.exit = 1;
						} else {
							fp.build(info_image, function() {
								pkg.fs.writeFile( info_fn, JSON.stringify(v), function (err) {
									if (err) cbk({status:'error'});
									else cbk(v);
								});
							});
						}
					}
				});		
			}			
			pkg.fs.readFile(info_fn,   'utf-8',  function(err, data) {
				if(err) { 
					pull_hub_info('http://'+ server +'/api/video/hub_info.api', fn.replace(new RegExp('^'+mnt_folder,'i'),''), cbk);
				} else {
					var v = {};
					try { v = JSON.parse(data); } catch(e) { }
					v.cache = 1;
					cbk(v);
				}
			});	
		};		
		
		_f['S2'] = function(cbk) {
			pkg.fs.stat(fn, function(err, stat) {
				if(!err) { 
					if (CP.data.V1.size == stat.size) cbk(fn); 
					else {
						var dt = new Date().getTime() - new Date(stat.birthtime).getTime();
						if (dt > 60000) {
							pkg.fs.unlink(fn, function(err) {
								cbk(false);
							});
						} else {
							cbk(false);
						}
					}
				} else {
					var request = http.get(url + '&cache_only=1&ip='+req.headers.host, function(response) {
						if (response.statusCode == 404 || response.statusCode == 500) {
							cbk(false);		
						} else {
							var file = pkg.fs.createWriteStream(fn);
							response.pipe(file);
							response.on('end', function() {
								 cbk(fn);
							});
						}	
					});					
					
				}
			});
		};		
		
		CP.serial(
			_f,
			function(data) {
				if (!node_cache_only && CP.data.IsMasterVideoReady.status != 'success') {
					res.redirect(url);
					return true;
				}					
				if (!CP.data.S2) {
					res.redirect(url);
					return true;
				}
				pkg.fs.stat(fn, function(err, data1) {
					if (err) { res.redirect(url);  }
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
	case 'video':
		if (type == 'section') {
			var l = req.query['l'], s = req.query['s'];
			if (!s || !l) { write404('wrong s or l'); return true; }
			var fn = folder_section + s + '_' + l + '.mp4';
			var info_fn = info_section +  s + '_' + l +'.json';
			var info_fd = info_section;
		} else {
			var fn = file_video;
			var info_fn = info_video;
			var info_fd = info_folder + 'video/';
		}
		var CP = new pkg.crowdProcess();
		var _f = {};
			
		_f['IsMasterVideoReady'] = function(cbk) { 
			 IsMasterVideoReady(cbk, CP);
		};
		
		_f['S0'] = function(cbk) { 
			var fp = new folderP();
			fp.build(video_folder + 'video/', function() { cbk(true);});
		};
		_f['S1'] = function(cbk) { 
			var fp = new folderP();
			fp.build(folder_section, function() { cbk(true);});
		};
		_f['V1'] = function(cbk) { 
			var pull_hub_info = function(url, fn, cbk) {
				request.post({
					url: url,
					form:{ fn: fn }, 
				}, function(error, response, body){
					if (error) {
						cbk({status:'failure', message:error.message}); CP.exit = 1;
					} else {	
						var v = {}; try { v = JSON.parse(body); } catch(e) { }
						if ((v.status !='success' || ! v.size)) {
							cbk({status:'failure', message:v.message}); CP.exit = 1;
						} else {
							fp.build(info_fd, function() {
								pkg.fs.writeFile( info_fn, JSON.stringify(v), function (err) {
									if (err) cbk({status:'error'});
									else cbk(v);
								});
							});
						}
					}
				});		
			}			
			pkg.fs.readFile(info_fn,   'utf-8',  function(err, data) {
				if(err) { 
					pull_hub_info('http://'+ server +'/api/video/hub_info.api', fn.replace(new RegExp('^'+mnt_folder,'i'),''), cbk);
				} else {
					var v = {};
					try { v = JSON.parse(data); } catch(e) { }
					v.cache = 1;
					cbk(v);
				}
			});
			
			
			
			
		};	
		
		_f['S2'] = function(cbk) {
			pkg.fs.stat(fn, function(err, stat) {
				if(!err) { 
					if (CP.data.V1.size == stat.size) cbk(fn); 
					else {
						var dt = new Date().getTime() - new Date(stat.birthtime).getTime();
						if (dt > 60000) {
							pkg.fs.unlink(fn, function(err) {
								cbk(false);
							});
						} else {
							cbk(false);
						}
						
					}
				} else {
					var request = http.get(url + '&cache_only=1&ip='+req.headers.host, function(response) {
						if (response.statusCode == 404 || response.statusCode == 500) {
							cbk(false);		
						} else {
							var file = pkg.fs.createWriteStream(fn);
							response.pipe(file);
							response.on('end', function() {
								 cbk(fn);
							});
						}	
					});							

				}
			});
			
		};
		
		CP.serial(
			_f,
			function(data) {
				if (!node_cache_only && CP.data.IsMasterVideoReady.status != 'success') {
					res.redirect(url);
					return true;
				}
				if (!CP.data.S2) {
					res.redirect(url);
					return true;
				}
				pkg.fs.stat(fn, function(err, data1) {
					
					if (node_cache_only) {
						if (err) { 
							res.send({status:'failure', message:err.message});
						} else {
							res.send({status:'success', vid:req.query['vid'], size:data1.size});
						}
						return true;
					}
					
					if (err) { res.redirect(url); }
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
							var maxChunk = 1024 * 1024; // 1MB at a time
							if (chunksize > maxChunk) {
							  end = start + maxChunk - 1;
							  chunksize = (end - start) + 1;
							}							      
						      
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
			50000
		);    
		break;			
	default:
		 write404('type error');  
}
