const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = '/var/shusiou_cache/tmpvideo/' + source_file + '/_t/',
    
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
    space_dir = 'shusiou/' + source_file + '/_t/',
    trunkSize = 1024 * 1024;

let tm = new Date().getTime();
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
var splitTrackes = function(cbk) {
	pkg.exec('cd ' + source_path + ' && split -b ' + trunkSize + ' ' +  source_file +  ' ' + tmp_folder + '', 					 
		function(err, stdout, stderr) {
			if (err) {
				cbk(err.message);
			} else {
				pkg.fs.readdir( tmp_folder, (err1, files) => {
					cbk((err1) ? err1.message : files);
				});			
			}
		});		
}	
_f['videoinfo'] = function(cbk) { // P_I0
	pkg.request(space_url +  space_dir + '_info.txt', 
	function (err, res, body) {
		let v = (err) ? false : {};
		if (v !== false) { 
			try {  v = JSON.parse(body); } catch (e) { v = false; }
		}
		if (v === false) { 
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
						writeInfo(v, function() {
							cbk(v);
						});
					});
				});
			});		
		} else {
			cbk(v);
		}
	});		
};

_f['tracks'] = function(cbk) {
	if (CP.data.videoinfo === false) {
		cbk('no videoinfo');
	} else {
		var folderP = require(env.site_path + '/api/inc/folderP/folderP');
		var fp = new folderP();		
		fp.build(tmp_folder, () => {
			pkg.fs.readdir( tmp_folder, (err, files) => {
				if (err || files.length != Math.ceil(CP.data.videoinfo.filesize / trunkSize)) {
					splitTrackes(cbk);
				} else {
					cbk(files);					
				}
			});			

		});
	}
};

_f['space'] = function(cbk) { 
	var params = { 
	  Bucket: space_id,
	  Delimiter: '',
	  Prefix: space_dir
	}, v = {};

	s3.listObjects(params, function (err, data) {
		if(err)cbk(err.message);
		else {
			for (var o in data.Contents) {
				v[data.Contents[o].Key.replace(space_dir, '')] = data.Contents[o].Size;
			}
			cbk(v);
		}
	});
}

_f['upload'] = function(cbk) { 
	let x =  CP.data['videoinfo'].x;
	let tracks = CP.data.tracks;
	if (typeof tracks === 'string') {
		cbk(tracks);
		CP.exit = 1;
		return true;
	} 
	let next =  tracks.filter(v => !x.includes(v));
	cbk(next);

}	
/*

_f['upload'] = function(cbk) { 
	if (CP.data['P_I1'] !== false) {
		var x = CP.data['videoinfo'].x;
		var CP1 = new pkg.crowdProcess();
		var _f1 = {}, f = CP.data.tracks;
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
	70000
);	
return true;
