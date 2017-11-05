var opt = req.query['opt'];

switch(opt) {
	case 'status':
		res.send('node_audit.js -- status');	
		break;
	default:
		res.send({status:'error', message:'Wrong opt value!'});
}
