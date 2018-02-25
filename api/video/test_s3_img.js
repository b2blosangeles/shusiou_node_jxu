const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
    trunkSize = 512 * 1024 * 10;

let l = ['https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/_a/video.mp4/_info.txt',
	'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/_a/video.mp4/s_540.mp4',
	'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/_a/video.mp4/s_550.mp4'];

var folderP = require(env.site_path + '/api/inc/folderP/folderP');
var CP = new pkg.crowdProcess();
var _f = {}; 
let dirn = '/tmp/video';
function downloadFile(url, callback) {
	let v = url.match(/([^\/]+)\/([^\/]+)$/),
	    fp = new folderP(), 
	    fn = dirn + '/' + v[1] + '_' + v[2];
	
	fp.build(dirn, () => {
		let file = pkg.fs.createWriteStream(fn);
		file.on('finish', function() {
			file.close(function() {
				callback(true);
			});  
		});
		pkg.request(url, function (error, response, body) {
		}).pipe(file);			
	});
}


_f['GET_INF02'] = function(cbk) {
	var CP1 = new pkg.crowdProcess();
	var _f1 = [];
	for (var i = 1; i < l.length; i++) {
		_f1['P_' + i] = (function(i) {
			return function(cbk1) {
				downloadFile(l[i], cbk1);
			}
		})(i);
	}
	CP1.parallel(
		_f1,
		function(results) {
			cbk(results);
		}, 3000);	
};

_f['GET_INFO3'] = function(cbk) {
	let cmd = 'cd ' + dirn + ' && ffmpeg -f concat -i niu.txt -codec copy output2.mp4 -y';
	pkg.exec(cmd, 
		function(error, stdout, stderr) {
			cbk(cmd);
	});
};

CP.serial(
	_f,
	function(results) {
		let fn = dirn + '/output2.mp4';
		pkg.fs.stat(fn, function(err, data1) {
		      var total = data1.size;
		      var range = req.headers.range;
		      if (range) {
				var parts = range.replace(/bytes=/, "").split("-");
				var partialstart = parts[0]; var partialend;
				  partialend =  parts[1];
				var start = parseInt(partialstart, 10);
				var end = partialend ? parseInt(partialend, 10) : total-1;
				var chunksize = (end-start)+1;
				var maxChunk = 1024 * 1024; // 1MB at a time
				if (chunksize > maxChunk) {
				  end = start + maxChunk - 1;
				  chunksize = (end - start) + 1;
				}							      

				var file = pkg.fs.createReadStream(fn, {start:start, end:end});
				res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
					'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
			       file.pipe(res);
			} else {
				res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + total + '/' + total, 
					'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });				
				var file = pkg.fs.createReadStream(fn);
				file.pipe(res);
			//	res.send('Need streaming player');
			}
		});
	},
	10000
);	
return true;
