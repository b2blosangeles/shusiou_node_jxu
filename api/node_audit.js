var diskspace = require(env.root_path + '/package/diskspace/node_modules/diskspace');
var opt = req.query['opt'];

switch(opt) {
	case 'status':
		var CP = new pkg.crowdProcess();
		var _f = {};
		_f['P0'] = function(cbk) {
		    pkg.fs.readFile('/var/.qalet_whoami.data', 'utf8', function(err,data) {
			if ((err) || !data) {
				cbk(false);		
			} else {
				cbk(data);
			}
		    });
		};
		_f['P1'] = function(cbk) {
			diskspace.check('/', function (err, space) {
			    space.total = Math.round(space.total * 0.000001);
			    space.free = Math.round(space.free * 0.000001);
			    space.used = Math.round(space.used * 0.000001); 
			    space.free_rate =  Math.floor(space.free  * 100 /  space.total); 
			    cbk(space);
			});	
		};
		CP.serial(
			_f,
			function(data) {
				res.send({status:'success',ip:data.results.P0, space:space});
			},
			500
		);		
		break;
	default:
		res.send({status:'error', message:'Wrong opt value!'});
}
