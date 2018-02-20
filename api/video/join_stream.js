let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_x/' + source_file + '/',
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com',  
    space_dir = '/shusiou/' + source_file + '/';

let stream = require("stream"),
a = new stream.PassThrough();
a.pipe(res);
var buff = new Buffer(100);
var CP1 = new pkg.crowdProcess();
var _f1 = {}; 
var fn = ['aa', 'ab'];


for (var i = 0; i < fn.length; i++) {
	_f1['P_' + i] = (function(i) {
		return function(cbk1) {
			let d = Buffer.from('');
			pkg.request(space_url +  space_dir + fn[i], 
			function (error, response, body) {})
			.on('data', function(data) {
				d = Buffer.concat([d, Buffer.from(data)]);
			}).on('end', function() {
				cbk1(d);
			});
		}
	})(i);	
}

CP1.serial(
	_f1,
	function(data) {
		for (var i = 0; i < fn.length; i++) {
			a.write(CP1.data['P_' + i]);
		}	
		a.end();
	},
	6000
);

