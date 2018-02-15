var stream = require("stream");
var a = new stream.PassThrough();
a.pipe(res);

var CP = new pkg.crowdProcess();
var _f = {};

//pkg.fs.readdir('/var/img', (err, files) => {
	var f = ['https://shusiou1.nyc3.digitaloceanspaces.com/xaa', 'https://shusiou1.nyc3.digitaloceanspaces.com/xab'];
 // res.send(f);
 // return true;
	/*
	files.forEach(file => {
		if (/x([a-z]+)/.test(file)) f[f.length] = file;
	});
	*/
	for (var i = 0; i < f.length; i++) {
		_f['P_' + i] = (function(i) { 
			return function(cbk) {
				let d = Buffer.from('');
				pkg.request(f[i], 
					function (error, response, body) {
				}).on('data', function(data) {
					d = Buffer.concat([d,  Buffer.from(data)]);
				}).on('end', function() {
					cbk(d);
				});
			}
		})(i)
	}
	CP.parallel(
		_f,
		function(data) {
			for (var i = 0; i < f.length; i++) {
				a.write(CP.data['P_' + i]);
			}	
			a.end();
		},
		30000
	);
//})
return true;
