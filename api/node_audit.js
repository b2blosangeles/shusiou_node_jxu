var opt = req.query['opt'];

switch(opt) {
	case 'status':
		var CP = new pkg.crowdProcess();
		var _f = {};
		    pkg.fs.readFile('/var/.qalet_whoami.data', 'utf8', function(err,data) {
			if ((err) || !data) {
				res.send('error');		
			} else {
				res.send(data);
			}
		    });			
		break;
	default:
		res.send({status:'error', message:'Wrong opt value!'});
}
