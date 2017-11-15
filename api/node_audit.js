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
		
		var CP = new pkg.crowdProcess();
		var _f = {};	


		for (var i = 0; i < files.length; i++) {
			_f[files[i]] = (function(i) {
				return function(cbk) {
					var fn = mnt_folder + 'videos/' + files[i] + '/video/video.mp4';
					pkg.fs.stat(fn, function(err, st) {
						if (err) {
							need_removed[need_removed.length] =  files[i];
							cbk(false);
						} else {
							if ((st.size) && list[files[i]] == st.size) {
								cached_files[cached_files.length] = files[i];
								cbk(true);
							} else {
								var d_time =  new Date().getTime() - new Date(st.ctime).getTime();
								if (d_time < 60000) {
									cbk(false);	
								} else {
									need_removed[need_removed.length] =  files[i];
									cbk(false);
								}
							}	
						}	
					});								
				}	
			})(i);
		}

		CP_n.parallel(
			_f,
			function(data) {
				res.send({data.results,cached_files:cached_files,need_removed:need_removed);
			},
			6000
		);						
	
		break;		
	default:
		res.send({status:'error', message:'Wrong opt value!'});
}
