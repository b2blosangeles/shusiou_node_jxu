const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_a/' + source_file + '/',
    
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
    space_dir = 'shusiou/_a/' + source_file + '/',
    trunkSize = 512 * 1024 * 10;

let tm = new Date().getTime();

function toHHMMSS(secs) {
    var sec_num = parseInt(secs, 10);    
    var hours   = Math.floor(sec_num / 3600) % 24;
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;    
    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":")
}

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

_f['CREATE_TEMP_PATH'] = function(cbk) {
	let folderP = require(env.site_path + '/api/inc/folderP/folderP'),  fp = new folderP();		
	fp.build(tmp_folder, () => { cbk(true) });
};

_f['INFO'] = function(cbk) { 
	pkg.request(space_url +  space_dir + '_info.txt', 
		function (err, res, body) {
			let v = {};
			if (!err) {
				try { 
					v = JSON.parse(body);
				} catch (e) { }
			}
			if (!v.video_length) {
				pkg.exec("ffprobe -i " + source_path + source_file + " -show_format -v quiet | sed -n 's/duration=//p'", 
				function(error, stdout, stderr) {
					if (error) cbk(false);
					else if (stdout) {
						let s = stdout.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '\\$&').
							replace(/[\n\r]/g, '\\n');
						writeInfo({video_length:parseInt(s)}, cbk);
					} else cbk(false);
				});		
			} else {
				v.cache = 1;
				cbk(v);
			}
	});	
};


_f['PUSH_SECTION'] = function(cbk) { 
	let _info =  CP.data['INFO'];
	if (!_info._x) _info._x = [];
	var videoLength = _info.video_length, a = [];
	if (!isNaN(videoLength)) {
		var CP1 = new pkg.crowdProcess();
		var _f1 = {}		
		for (var i = 0 ; i < videoLength; i+=10) {
			_f1['P_'+i] = (function(i) {
				return function(cbk1) {
					if ((new Date().getTime() - tm) > 10000) {
						cbk1(i + ' -- skipped as timeout');
						CP1.exit = 1;
					} else {
						var local_file = tmp_folder + 's_' + i + '_' + (i + 10) + '.mp4';
						pkg.exec('ffmpeg -i ' +  source_path + source_file + ' -t 00:00:10 -c copy ' +  
							local_file +' -ss ' +  toHHMMSS(i) + ' -y', 
							function(error, stdout, stderr) {

							
							//----
							
								pkg.fs.readFile(local_file, function (err, data0) {
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
										if (_info._x.indexOf(i) === -1) {
											_info._x.push(i);
											writeInfo(_info, cbk1);
										} else {
											cbk1(i + ' -- Done');
										}

									 }	 
								     });
								});
								
							//	----
							});
					}	
				}})(i);	
		}
		CP1.serial(
			_f1,
			function(results) {
				cbk(results);
			},
			50000
		);
	} else {
		cbk('Error on PUSH_SECTION');
	} 
};

/*
_f['P_A'] = function(cbk) {
	pkg.fs.exists(tmp_folder, function(exists) {
		if (!exists) {
			var folderP = require(env.site_path + '/api/inc/folderP/folderP');
			var fp = new folderP();		
			fp.build(tmp_folder, () => {
				pkg.exec('cd ' + source_path + '&& split --bytes=' + trunkSize + ' ' + source_file +  ' ' + tmp_folder, 
				function(error, stdout, stderr) {
					if (error) cbk(false);
					else if (stdout) cbk(true);
					else cbk(false);
				});
			});
		} else {
			cbk(true)
		}
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
*/
CP.serial(
	_f,
	function(results) {
		res.send(results);
	},
	300000
);	
return true;
