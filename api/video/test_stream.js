var stream = require("stream");
var a = new stream.PassThrough();
a.pipe(res);

var CP = new pkg.crowdProcess();
var _f = {};

pkg.fs.readdir('/var/img', (err, files) => {
	var f = [];
	files.forEach(file => {
		if (/x([a-z]+)/.test(file)) f[f.length] = file;
	});
	for (var i = 0; i < f.length; i++) {
		_f['P_' + i] = (function(i) { 
			return function(cbk) {
				let d = Buffer.from('');
				pkg.request('http://198.199.120.18/api/video/test_niu.api?file=' + f[i], 
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
})
return true;
var CP = new pkg.crowdProcess();
var _f = {};
_f['xaa'] = function(cbk) {
	let d = Buffer.from('');
	pkg.request('http://198.199.120.18/api/video/test_niu.api?file=xaa', 
		function (error, response, body) {
	}).on('data', function(data) {
		d = Buffer.concat([d,  Buffer.from(data)]);
	}).on('end', function() {
		cbk(d);
	});	
}
_f['xab'] = function(cbk) {
	let d = Buffer.from('');
	pkg.request('http://198.199.120.18/api/video/test_niu.api?file=xab', 
		function (error, response, body) {
	}).on('data', function(data) {
		d = Buffer.concat([d,  Buffer.from(data)]);
	}).on('end', function() {
		cbk(d);
	});	
}
CP.parallel(
	_f,
	function(data) {
		//res.send(data);
		a.write(CP.data.xaa);
		a.write(CP.data.xab);
		a.end();
	},
	30000
);
return true;
