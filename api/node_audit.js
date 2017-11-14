var opt = req.query['opt'];
var channel = require(env.site_path + '/api/cfg/channel.json');
switch(opt) {
	case 'status':
		var CP = new pkg.crowdProcess();
		var _f = {};
		_f['P0'] = function(cbk) {
		    pkg.fs.readFile('/var/.qalet_whoami.data', 'utf8', function(err,data) {
			if ((err) || !data) {
				cbk(false);		
			} else {
				cbk(data.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' '));
			}
		    });
		};
		_f['P1'] = function(cbk) {
			var diskspace = require(env.root_path + '/package/diskspace/node_modules/diskspace');
			diskspace.check('/', function (err, space) {
			    space.total = Math.round(space.total * 0.000001);
			    space.free = Math.round(space.free * 0.000001);
			    space.used = Math.round(space.used * 0.000001); 
			    space.free_rate =  Math.floor(space.free  * 100 /  space.total); 
			    space.channel = channel.channel;
			    cbk(space);
			});	
		};
		CP.serial(
			_f,
			function(data) {
				if (data.results.P0) res.send({status:'success',ip:data.results.P0, space:data.results.P1});
				else res.send({status:'failure'});
			},
			500
		);		
		break;
	case 'files_status':
		var mnt_folder = '/var/shusiou-video/'
		var childProcess = require('child_process')
		var CP = new pkg.crowdProcess();
		var _f = {}, list = req.body.list;
		var cached_files = [], need_removed = [];
		
		_f['I0'] = function(cbk) {
			pkg.fs.readdir(mnt_folder + 'videos/', function(error, files) {
				if (error) { cbk_s({status:'failure',message:error.message}); CP_s.exit = 1; return true; }
				else {
					var CP_n = new crowdProcess();
					var _f_n = {};				
					for (var i = 0; i < files.length; i++) {
						_f_n[files[i]] = (function(i) {
							return function(cbk_n) {
								var fn = videos_folder + files[i] + '/video/video.mp4';
								pkg.fs.stat(fn, function(err, st) {
									if (err) {
										cbk_n(false);
									} else {
										cbk_n((st)?st.size:'');
									}	
								});								
							}	
						})(i);
					}
					CP_n.parallel(
						_f_n,
						function(data) {
							cbk(data);
							return true;
							var need_remove =  files.filter(x => db_videos.indexOf(x) < 0 );

							var remove_cmd = 'cd ' + mnt_folder  + 'videos/ && rm -fr ';
							for (var j= 0 ; j < Math.min(need_remove.length,30); j++) {
								remove_cmd += ' ' + need_remove[j] + '  ';
							}

							if (need_remove.length) {
								var ls = childProcess.exec(remove_cmd, 		   
									function (error, stdout, stderr) {
										cbk_s({need_remove:need_remove, files:files, server_list:data.results});
									});

							} else {
								cbk_s({need_remove:need_remove, files:files, server_list:data.results});
							}							

						},
						6000
					);				
				};

			});						
			
		};
		
		for (var o in list) {
			_f['V_'+ o] = (function(o) {
				return function(cbk) {
					var fn = mnt_folder + 'videos/' + o + '/video/video.mp4';
					pkg.fs.stat(fn, function(err, st) {
						if (err) {
							cbk(false);
						} else {
							if (st.size == list[o]) {
								cached_files[cached_files.length] = o;
							}	
							cbk((st)?st.size:'');
						}	
					});
				}
			})(o);	
		}	
		CP.parallel(
			_f,
			function(data) {
				res.send({data:data, cached_files:cached_files});
			}, 3000
		);	
		return true;
		break;		
	default:
		res.send({status:'error', message:'Wrong opt value!'});
}
