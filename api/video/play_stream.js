function write404(msg) {
	res.writeHead(404);
	res.write(msg);
	res.end();	
}

var type= req.query['type'], vid = req.query['vid'], server = req.query['server'];
if (!type || !vid) {  write404('vid or type error '); return true; }
res.send(req.url);
