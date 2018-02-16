const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'I7F32YN3VOECILTSWUGR',
    secretAccessKey: '/8zmAOfrgHaq4eKYjWflIhCuyU5RCclnkG8FEJcDNH4'
});
 
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
removeFolder(s3, 'shusiou001', 'niu/a/b/ad', function(data) {
	res.send(data);
});
*/
// return true;

pkg.fs.readdir('/var/img/x/', (err, files) => {
	var f = [];
	files.forEach(file => {
		// if (/x([a-z]+)/.test(file)) 
		f[f.length] = file;
	});
	var CP = new pkg.crowdProcess();
	var _f = {}; 
	for (var i = 0; i < f.length; i++) {
		_f['P_' + i] = (function(i) { 
			return function(cbk) {
				pkg.fs.readFile('/var/img/x/' + f[i], function (err, data0) {
				  if (err) { throw err; }
					
				     var base64data = new Buffer(data0, 'binary');
				     var params = {
					 Body: base64data,
					 Bucket: "shusiou1",
					 Key: 'niu/a/b/' + f[i],
					 ContentType: 'video/mp4',
					 ACL: 'public-read'
				     };
				   
					
				     var params_d = {
					Bucket: "shusiou001",
					Key: 'niu/' + f[i]
				     };	
						
				     s3.putObject(params, function(err, data) {
					 if (err) cbk(err.message);
					 else    cbk(data);
				     });
					/*
				     s3.deleteObject(params_d, function(err, data) {
					 if (err) cbk(err.message + '-b-');
					 else    cbk(data);
				     }); */
				}); 
			}
		})(i)
	}	
	CP.serial(
		_f,
		function(results) {
			res.send(results);
		},
		60000
	);	
	
});  
return true;
