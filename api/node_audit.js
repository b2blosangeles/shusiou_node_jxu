var opt = req.query['opt'];

switch(opt) {
	case 'status':
		var CP = new pkg.crowdProcess();
		var _f = {};
		_f['P0'] = function(cbk) {
		    pkg.fs.readFile('/var/.qalet_whoami.data', 'utf8', function(err,data) {
			if ((err) || !data) {
				res.send('error');		
			} else {
				res.send(data);
			}
		    });
		};
		CP.serial(
			_f,
			function(data) {
				res.send({status:'success',ip:data.results.P0});
			},
			1000
		);		
		
		break;
	default:
		res.send({status:'error', message:'Wrong opt value!'});
}
