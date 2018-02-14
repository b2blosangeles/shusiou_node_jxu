var stream = require("stream")
var a = new stream.PassThrough();
a.pipe(res);
var CP = new pkg.crowdProcess();
var _f = {};
_f['xaa'] = function(cbk) {
	pkg.request('http://198.199.120.18/api/video/test_niu.api?file=xaa', 
		function (error, response, body) {
	}).on('data', function(data) {
		a.write(data);
	}).on('end', function(data) {
		cbk(true)
	});	
}
_f['xab'] = function(cbk) {
	pkg.request('http://198.199.120.18/api/video/test_niu.api?file=xab', 
		function (error, response, body) {
	}).on('data', function(data) {
		a.write(data);
	}).on('end', function(data) {
		cbk(true)
	});	
}
CP.serial(
	_f,
	function(data) {
		a.end();
	},
	30000
);
return true;
let g = pkg.request('http://198.199.120.18/api/video/test_niu.api?file=xaa', 
	function (error, response, body) {
});
g.on('data', function(data) {
	a.write(data);
	//a.write(new Buffer(data, 'binary'));
});
g.on('end', function(data) {
	let g1 = pkg.request('http://198.199.120.18/api/video/test_niu.api?file=xab', 
		function (error, response, body) {
	});
	g1.on('data', function(data) {
		a.write(data);
		//a.write(new Buffer(data, 'binary'));
	});
	g1.on('end', function(data) {
		a.end()
	});
});
return true;
