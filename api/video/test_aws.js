const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'AED442OVG2T3GE6IVPWQ',
    secretAccessKey: 'tvzSwhiJxlQ1RJNalUD0ATDeIZd0ko7P1Zs371J6Vi4'
});
let source_path = '/var/img/',
    south_file = source_path + 'video.mp4',
    tmp_folder = '/var/img/x/',
    space_dir = 'shusiou/movies/';
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
/*
removeFolder(s3, 'shusiou001', '', function(data) {
	res.send(data);
});
*/
// return true;

pkg.fs.readdir( tmp_folder, (err, files) => {
	var f = [];
	files.forEach(file => {
		// if (/$([a-z]+)/.test(file))
		f[f.length] = file;
	});
	var CP = new pkg.crowdProcess();
	var _f = {}; 
	_f['P_I0'] = function(cbk) { 
		let buff = new Buffer(100);
		pkg.fs.stat(south_file, function(err, stat) {
			pkg.fs.open(south_file, 'r', function(err, fd) {
				pkg.fs.read(fd, buff, 0, 100, 0, function(err, bytesRead, buffer) {
					var start = buffer.indexOf(new Buffer('mvhd')) + 17;
					var timeScale = buffer.readUInt32BE(start, 4);
					var duration = buffer.readUInt32BE(start + 4, 4);
					var movieLength = Math.floor(duration/timeScale);
					
				     var params = {
					 Body: JSON.stringify({fsize:stat.size,time_scale:timeScale, 
							       duration: duration, length:movieLength, x:[]}),
					 Bucket: "shusiou01",
					 Key: space_dir + '_info.txt',
					 ContentType: 'text/plain',
					 ACL: 'public-read'
				     };	
				     s3.putObject(params, function(err, data) {
					 if (err) cbk(err.message);
					 else    cbk(true);
				     });
				});
			});
		});
	};
	_f['P_I1'] = function(cbk) { 
		let buff = new Buffer(100);
		pkg.fs.stat(south_file, function(err, stat) {
			pkg.fs.open(south_file, 'r', function(err, fd) {
				pkg.fs.read(fd, buff, 0, 100, 0, function(err, bytesRead, buffer) {
					var start = buffer.indexOf(new Buffer('mvhd')) + 17;
					var timeScale = buffer.readUInt32BE(start, 4);
					var duration = buffer.readUInt32BE(start + 4, 4);
					var movieLength = Math.floor(duration/timeScale);
					
				     var params = {
					 Body: JSON.stringify({fsize:stat.size,time_scale:timeScale, 
							       duration: duration, length:movieLength, x:[]}),
					 Bucket: "shusiou01",
					 Key: space_dir + '_info.txt',
					 ContentType: 'text/plain',
					 ACL: 'public-read'
				     };	
				     s3.putObject(params, function(err, data) {
					 if (err) cbk(err.message);
					 else    cbk(true);
				     });
				});
			});
		});
	};	
	for (var i = 0; i < f.length; i++) {
		_f['P_' + i] = (function(i) { 
			return function(cbk) {
				pkg.fs.readFile( tmp_folder + f[i], function (err, data0) {
				  if (err) { throw err; }
				     var base64data = new Buffer(data0, 'binary');
				     var params = {
					 Body: base64data,
					 Bucket: "shusiou01",
					 Key: space_dir + f[i],
					 ContentType: 'video/mp4',
					 ACL: 'public-read'
				     };	
				     s3.putObject(params, function(err, data) {
					 if (err) cbk(err.message);
					 else    cbk(data);
				     });
				}); 
			}
		})(i)
	}
	//CP.parallel(
	CP.serial(
		_f,
		function(results) {
			res.send(results);
		},
		300000
	);	
	
});  
return true;
