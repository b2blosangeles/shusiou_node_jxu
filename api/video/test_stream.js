var CP = new pkg.crowdProcess();
var _f = {};

var w = req.param['w'], s = req.query['s'];

let stream = require("stream"),
    a = new stream.PassThrough();
 a.pipe(res);	
pkg.fs.readdir('/var/img/x/', (err, files) => {
	var f = [];
	
	var range = req.headers.range;
	if (range) {
		res.send(range);
		return true;
	}
	
	files.forEach(file => {
		// if (/x([a-z]+)/.test(file)) 
		f[f.length] = file;
	});
	//for (var i = 0; i < 17; i+=1) {
	for (var i = 0; i < f.length; i++) {
		_f['P_' + i] = (function(i) { 
			return function(cbk) {
				let d = Buffer.from('');
				pkg.request('https://shusiou1.nyc3.digitaloceanspaces.com/'+ f[i], 
					function (error, response, body) {
				}).on('data', function(data) {
					a.write(data);
					// d = Buffer.concat([d,  Buffer.from(data)]);
				}).on('end', function() {
					cbk(true);
				});
			}
		})(i)
	}
	CP.serial(
	//CP.parallel(
		_f,
		function(data) {

			
			// a.pipe(res);			
			for (var i = 0; i < f.length; i++) {
			//for (var i = 0; i < 17; i+=1) {
			//	a.write(CP.data['P_' + i]);
			}	
			a.end();
		},
		30000
	);
})
return true;
