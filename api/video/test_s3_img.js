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
	'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/_a/video.mp4/s_550.mp4',
	'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/_a/video.mp4/s_20.mp4'];

var folderP = require(env.site_path + '/api/inc/folderP/folderP');
var CP = new pkg.crowdProcess();
var _f = {}; 

function downloadFile(url, callback) {
	let v = url.match(/([^\/]+)\/([^\/]+)$/),
	    dirn = '/tmp/video/' + v[1],
	    fp = new folderP(), 
	    fn = dirn + '/' + v[2];
	
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


// let stream = require("stream"),
// a = new stream.PassThrough();
// a.pipe(res);
// res.writeHead(200, {'Content-Type': 'video/mp4' });

/*
_f['GET_X'] = function(cbk) {
	pkg.request(l[0], 
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
*/
/*
_f['GET_INFO1'] = function(cbk) {	
		cbk(true);
	return true;
	let d = Buffer.from('');
	pkg.request(l[1], function (error, response, body) {})
		.on('data', function(data) {
				d = Buffer.concat([d, Buffer.from(data)]);
		}).on('end', function() {
			let buffer = d;
				// pkg.fs.read(body, buff, 0, 100, 0, function(err, bytesRead, buffer) {
				
					var start = buffer.indexOf(new Buffer('mvhd')) + 17;
					var timeScale = buffer.readUInt32BE(start, 4);
					var duration = buffer.readUInt32BE(start + 4, 4);
					var movieLength = Math.floor(duration/timeScale);
					var v = {start:start, time_scale:timeScale, trunksize: trunkSize,
						duration: duration, length:movieLength, x:[], status:0};
				
					cbk(v);		
		
			//	a.write(d);
			//	a.end();
				
		});
};
*/
_f['GET_INF02'] = function(cbk) {
	downloadFile(l[2], cbk);
};

_f['GET_INFO3'] = function(cbk) {
	let buff = new Buffer(100);
	pkg.request({
   			method: 'GET',
   		 	url: l[2],
			encoding: null
		},
		function (err, resp, body) {
			if (err) { 
				cbk(false); 
			} else {
				// let buffer = Buffer.from(body);
				let buffer = body;
				// pkg.fs.read(body, buff, 0, 100, 0, function(err, bytesRead, buffer) {
				
					var start = buffer.indexOf(new Buffer('mvhd')) + 17;
					var timeScale = buffer.readUInt32BE(start, 4);
					var duration = buffer.readUInt32BE(start + 4, 4);
					var movieLength = Math.floor(duration/timeScale);
					var v = {start:start, time_scale:timeScale, trunksize: trunkSize,
						duration: duration, length:movieLength, x:[], status:0};
				
					cbk(v);
				// });
				
			}
		});
	/*
	pkg.fs.stat(l[1], function(err, stat) {
		pkg.fs.open(l[1], 'r', function(err, fd) {
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
	*/
};

/*
_f['GET_FOLDERS'] = function(cbk) {
	let buckets = CP.data.GET_BUCKETS.Buckets;
	var CP1 = new pkg.crowdProcess(), _f1 = {};
	for (let i = 0; i < buckets.length; i++) {
		_f1[buckets[i].Name] = (function(i) {
			return function(cbk1) {
				var params = {
					Bucket: buckets[i].Name //, 
					// MaxKeys: 2
				};
				s3.listObjects(params, function(err, data) {
					if (err) {
						return cbk1(null); 
					} else {
						let l = data.Contents, v = [];
						for (var  j = 0 ; j < l.length; j++) {
							v.push({link: space_url + '' + l[j].Key, size:l[j].Size});
						}
						return cbk1(v);       
					}
				});
			}
		})(i);
	}
	CP1.serial(
		_f1,
		function(results) {
			cbk(results.results);
		},
		60000	
	)
};
*/
CP.serial(
	_f,
	function(results) {
		res.send(results);
		return true;
		//res.send([CP.data.GET_INFO1]);
		//return true;
		//res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + (CP.data.GET_INFO1.duration)  + '/' +  (CP.data.GET_INFO1.duration), 
		//    'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });	
		res.writeHead(200, {'Content-Type': 'video/mp4' });	
		let stream = require("stream"),
		a = new stream.PassThrough();
		a.pipe(res);		
		let d = Buffer.from('');
		pkg.request(l[1], function (error, response, body) {})
			.on('data', function(data) {
					d = Buffer.concat([d, Buffer.from(data)]);
			}).on('end', function() {
					a.write(d);
					a.end();
			});		
		
	},
	80000
);	
return true;
