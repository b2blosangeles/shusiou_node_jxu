function write404(msg) {
	res.writeHead(404);
	res.write(msg);
	res.end();	
}

var type= req.query['type'], vid = req.query['vid'], server = req.query['server'];
var patt = /([?&]server)=([^#&]*)/i;

if (!type || !vid || !server) {  write404('vid or type error '); return true; }

var url = 'http://'+ server + req.url.replace(patt, '');
res.redirect(url);
