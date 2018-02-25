const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/_a';


let 	info_link = '/video.mp4/_info.txt',
	l = [
		'/video.mp4/s_0.mp4'
	];

var folderP = require(env.site_path + '/api/inc/folderP/folderP');
var CP = new pkg.crowdProcess();
var _f = {}; 
let dirn = '/tmp/video';

let range = req.headers.range,
    start = 0, duration = 0;
    maxChunk = 1024 * 1024; // 1MB at a time

function downloadFile(url, callback) {
	let v = url.match(/([^\/]+)\/([^\/]+)$/),
	    fp = new folderP(), 
	    fn = dirn + '/' + v[1] + '_' + v[2];
	
	fp.build(dirn, () => {
		let file = pkg.fs.createWriteStream(fn);
		file.on('finish', function() {
			file.close(function() {
				callback(fn);
			});  
		});
		pkg.request(url, function (error, response, body) {
		}).pipe(file);			
	});
}
_f['DURATION'] = function(cbk) {
	let url = space_url + '/video.mp4/s_0.mp4';
	let buffer = Buffer.from('');
	pkg.request(url, function (error, response, body) {})
		.on('data', function(data) {
			buffer = Buffer.concat([buffer, Buffer.from(data)]);
		}).on('end', function() {
			var start = buffer.indexOf(new Buffer('mvhd')) + 17;
			var timeScale = buffer.readUInt32BE(start, 4);
			var duration = buffer.readUInt32BE(start + 4, 4);
			var movieLength = Math.floor(duration/timeScale);
			var v = {start:start, time_scale:timeScale,
				duration: duration, length:movieLength};
			duration = v.duration;
			cbk(v);					
		});	
};
_f['DL_0'] = function(cbk) {
	/*
	downloadFile(space_url + info_link, function(fn) {
		cbk(fn);
	});
	return true;
	*/
	var params = {
		Bucket: 'shusiou-d-01'
	};
	s3.listObjects(params, function(err, data) {
		if (err) {
			return cbk(null); 
		} else {
			let list = data.Contents, v = [];
			for (var  j = 0 ; j < list.length; j++) {
				v.push({link: space_url + '' + list[j].Key, size:list[j].Size});
			}
			return cbk('v');       
		}
	});	
};


_f['DL_1'] = function(cbk) {
	var CP1 = new pkg.crowdProcess();
	var _f1 = [];
	for (var i = 0; i < l.length; i++) {
		_f1['P_' + i] = (function(i) {
			return function(cbk1) {
				downloadFile(space_url + l[i], cbk1);
			}
		})(i);
	}
	CP1.parallel(
		_f1,
		function(results) {
			cbk(results);
		}, 3000);	
};


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

_f['FFMPEG'] = function(cbk) {
	let cmd = 'cd ' + dirn + ' && ffmpeg -f concat -i niu.txt -codec copy output2.mp4 -y';
	pkg.exec(cmd, 
		function(error, stdout, stderr) {
			cbk(cmd);
	});
};

CP.serial(
	_f,
	function(results) {
		// res.send(results);
		// return true;
		
		let fn = dirn + '/output2.mp4';
		pkg.fs.stat(fn, function(err, data1) {
		      var total = data1.size;
		      var range = req.headers.range;
		      if (range) {
				var parts = range.replace(/bytes=/, "").split("-");
				var partialstart = parts[0]; 
			      	var partialend  =  parts[1];
				start = parseInt(partialstart, 10);
				var end = partialend ? parseInt(partialend, 10) : total-1;
				var chunksize = (end-start)+1;
				if (chunksize > maxChunk) {
				  end = start + maxChunk - 1;
				  chunksize = (end - start) + 1;
				}	
			//      	end = start + duration;
				res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
					'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
			       	pkg.fs.createReadStream(fn, {start:start, end:end}).pipe(res);
			} else {
				res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + total + '/' + total, 
					'Accept-Ranges': 'bytes', 'Content-Length': maxChunk, 'Content-Type': 'video/mp4' });				
				pkg.fs.createReadStream(fn).pipe(res);
			//	res.send('Need streaming player');
			}
		});
	},
	10000
);	
return true;
