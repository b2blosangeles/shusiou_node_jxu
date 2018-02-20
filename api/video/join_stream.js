var CP = new pkg.crowdProcess();
var _f = {};
var buff = new Buffer(100);

let source_path = '/var/img/',
    source_file = 'video.mp4',
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com',  
    space_dir = '/shusiou/' + source_file + '/';

var CP = new pkg.crowdProcess();
var _f = {}; 
var stream = pkg.fs.createWriteStream(source_path + "videoniu.mp4", {flags:'a'});
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
		var CP1 = new pkg.crowdProcess();
		var _f1 = {}; 
		for (var i = 0; i < cfg.x.length; i++) {
			_f1['P_' + i] = (function(i) {
				return function(cbk1) {
					let d = Buffer.from('');
					pkg.request(space_url + space_dir + cfg.x[i], 
					function (error, response, body) {})
					.on('data', function(data) {
						//d = "Buffer.concat([d, Buffer.from(data)])";
						response.pipe(stream)
					}).on('end', function() {

						cbk(true);
					});
				}
			})(i);	
		}

		CP1.serial(
			_f1,
			function(result) {
				stream.close(
					function() {
						res.send(result);
					}
				);				
				
			},
			6000
		);
		
		// res.send(space_url +  space_dir + '_info.txt');
	},
	300000
);
return true;
