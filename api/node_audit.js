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
		var CP = new pkg.crowdProcess();
		var _f = {}, list = req.body.list;
		var mnt_folder = '/var/shusiou-video/';

		for (var i = 0; i < list.length; i++) {
			_f['D_'+i] = (function(i) {
				return function(cbk) {
					var fn = mnt_folder + 'videos/' + list[i] + '/video/video.mp4';
					pkg.fs.stat(fn, function(err, st) {
						cbk(((st)?st.size:'')+'');
					});
				}
			})(i);
		}
		CP.parallel(
			_f,
			function(data) {
				res.send(data.result);
			},
			3000
		);		
	//	res.send(req.body.list.join(','));		
		break;		
	default:
		res.send({status:'error', message:'Wrong opt value!'});
}
