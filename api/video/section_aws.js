const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_s/' + source_file + '/',
    
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
    space_dir = 'shusiou/' + source_file + '/_s/',
    trunkSize = 1024 * 1024 * 1;

let tm = new Date().getTime();

function removeFolder(s3, bucketName, folder, callback){
	var params = {
		Bucket: bucketName,
		Prefix: folder
	};
	s3.listObjects(params, function(err, data) {
		if (err) return callback(err);
		if (data.Contents.length == 0) callback({"Deleted":[],"Errors":[]});
		var params = {
			Bucket: bucketName
		};		
		params.Delete = {Objects:[]};
		data.Contents.forEach(function(content) {
			params.Delete.Objects.push({Key: content.Key});
		});
		s3.deleteObjects(params, function(err, d) {
			if (err) return callback(err);
			else callback(d);
		});	
	});
}

// ffmpeg -i video.mp4 -c copy -map 0 -segment_time 5 -reset_timestamps 1 -f segment _s/s_%d.mp4

var CP = new pkg.crowdProcess();
var _f = {}; 

var writeInfo = function(v, cbk) {
     var params = {
	 Body: JSON.stringify(v),
	 Bucket: space_id,
	 Key: space_dir + '_info.txt',
	 ContentType: 'text/plain',
	 ACL: 'public-read'
     };	
     s3.putObject(params, function(err, data) {
	 if (err) cbk(false);
	 else    cbk(v);
     });		
}
_f['ANALYZE_SOURCE'] = function(cbk) {
	let buff = new Buffer(100);
	pkg.fs.stat(source_path + source_file, function(err, stat) {
		pkg.fs.open(source_path + source_file, 'r', function(err, fd) {
			pkg.fs.read(fd, buff, 0, 100, 0, function(err, bytesRead, buffer) {
				var start = buffer.indexOf(new Buffer('mvhd')) + 17;
				var timeScale = buffer.readUInt32BE(start, 4);
				var duration = buffer.readUInt32BE(start + 4, 4);
				var movieLength = Math.floor(duration/timeScale);
				var v = {filesize:stat.size, start:start, time_scale:timeScale, trunksize: trunkSize,
					duration: duration, length:movieLength, x:[], status:0};
				cbk(v);
			});
		});
	});	
};

_f['CREATE_DIR'] = function(cbk) {
	var folderP = require(env.site_path + '/api/inc/folderP/folderP');
	var fp = new folderP();		
	fp.build(tmp_folder, () => {
	//	ffmpeg -i video.mp4 -c copy -map 0 -segment_time 5 -reset_timestamps 1 -f segment _s/s_%d.mp4

		pkg.exec('cd ' + source_path + ' && ffmpeg -i ' +  source_file + 
			 ' -c copy -map 0 -segment_time 5 -reset_timestamps 1 -f segment ' + tmp_folder + 's_%d.mp4', 					 
		function(error, stdout, stderr) {
			if (error) cbk(false);
			else if (stdout) cbk(true);
			else cbk(false);
		});
	});	
};

_f['P_I'] = function(cbk) { 
	pkg.fs.readdir( tmp_folder, (err, files) => {
		var f = [];
		files.forEach(file => {
			f[f.length] = file;
		});
		cbk(f);
	});	
};	

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

_f['P_I1'] = function(cbk) { 
	if (CP.data['P_I0'] !== false) {
		cbk(CP.data['P_I0']);
	} else {
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
					writeInfo(v, cbk);
				});
			});
		});

	} 
};

_f['P_I2'] = function(cbk) { 
	if (CP.data['P_I1'] !== false) {
		var x = CP.data['P_I1'].x;
		var CP1 = new pkg.crowdProcess();
		var _f1 = {}, f = CP.data.P_I;
		for (var i = 0; i < f.length; i++) {
			_f1['P_' + i] = (function(i) { 
				return function(cbk1) {
					if (new Date().getTime() - tm > 30000) {
						cbk1(true); return true;
					}
					if (x.indexOf(f[i]) !==-1) {
						cbk1('--skip--'); return true;
					}
					pkg.fs.readFile( tmp_folder + f[i], function (err, data0) {
					  if (err) { throw err; }
					     var base64data = new Buffer(data0, 'binary');
					     var params = {
						 Body: base64data,
						 Bucket: space_id,
						 Key: space_dir + f[i],
						 ContentType: 'video/mp4',
						 ACL: 'public-read'
					     };	
					     s3.putObject(params, function(err, data) {
						 if (err) cbk1(err.message);
						 else {
							 let v = CP.data['P_I1'];
							 v.x[v.x.length] = f[i];
							 if (i === (f.length - 1)) {
								v.status = 1;
							 }
							 writeInfo(v, cbk1);
							 // cbk1(data);
						 }	 
					     });
					}); 
				}
			})(i)
		}			
		CP1.serial(
			_f1,
			function(results) {
				cbk('results');
			},
			50000
		);			
	} else {
		cbk(false)
	}
};

CP.serial(
	_f,
	function(results) {
		res.send(results);
	},
	70000
);	
return true;
