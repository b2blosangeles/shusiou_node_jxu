let stream = require("stream"),
a = new stream.PassThrough();
a.pipe(res);
var buff = new Buffer(100);
var CP1 = new pkg.crowdProcess();
var _f1 = {}; 
var fn = ['aa'];
for (var i = 0; i < fn.length; i++) {
	_f1['P_' + i] = (function(i) {
		return function(cbk1) {
			let d = Buffer.from('');
			pkg.request('/var/img/_x/video.mp4/' + fn[i], 
			function (error, response, body) {})
			.on('data', function(data) {
				d = Buffer.concat([d, Buffer.from(data)]);
			}).on('end', function() {
				cbk1(d);
			});
		}
	})(i);	
}

CP1.parallel(
	_f1,
	function(data) {
		for (var i = 0; i < fn.length; i++) {
			a.write(CP1.data['P_' + i]);
		}	
		a.end();
	},
	6000
);

