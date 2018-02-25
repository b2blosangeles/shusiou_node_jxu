const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_x/' + source_file + '/',
    
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
    space_dir = 'shusiou/' + source_file + '/',
    trunkSize = 512 * 1024 * 10;

var CP = new pkg.crowdProcess();
var _f = {}; 

_f['P_A'] = function(cbk) {
	let buff = new Buffer(100);
	pkg.fs.stat(source_path + source_file, function(err, stat) {
		pkg.fs.open(source_path + source_file, 'r', function(err, fd) {
			pkg.fs.read(fd, buff, 0, 100, 0, function(err, bytesRead, buffer) {
				var start = buffer.indexOf(new Buffer('mvhd')) + 17;
				var timeScale = buffer.readUInt32BE(start, 4);
				var duration = buffer.readUInt32BE(start + 4, 4);
				var movieLength = Math.floor(duration/timeScale);
				var v = {filesize:stat.size,time_scale:timeScale, trunksize: trunkSize,
					duration: duration, length:movieLength, x:[], status:0};
				cbk(v);
			});
		});
	});	
};

CP.serial(
	_f,
	function(results) {
		res.send(results);
	},
	300000
);	
return true;
