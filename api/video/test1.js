var CP = new pkg.crowdProcess();
var _f = {};
var buff = new Buffer(100);

let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_x/' + source_file + '/',
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com',  
    space_dir = '/shusiou/' + source_file + '/';

var CP = new pkg.crowdProcess();
var _f = {}; 

_f['P_I0'] = function(cbk) { 
	pkg.request(space_url +  space_dir + '_info.txt', 
	function (err, res, body) {
		if (err) { 
			cbk(false); 
		} else {
			let v = {};
			try { 
				v = JSON.parse(body);
			} catch (e) { v = false; }
			cbk(v);
		}
	});		
};
CP.serial(
	_f,
	function(results) {
		var cfg = CP.data.P_I0;
		let stream = require("stream"),
		a = new stream.PassThrough();
		a.pipe(res);
		
		
		pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/video.mp4/jxu.mp4', 
		function (error, response, body) {})
		.on('data', function(data) {
			d = Buffer.concat([d, Buffer.from(data)]);
		}).on('end', function() {
			a.write(CP1.data['P_' + i]);
			a.end();
		});
		
	},
	300000
);
return true;
