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
	CP1.serial(
		_f1,
		function(results) {
			cbk(results);
		}, 3000);	
};

/*
_f['GET_INFO3'] = function(cbk) {
	let cmd = 'cd ' + dirn + ' && ffmpeg -f concat -i niu.txt -codec copy output2.mp4';
	pkg.exec(cmd, 
		function(error, stdout, stderr) {
			else cbk(cmd);
	});
};
*/
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
