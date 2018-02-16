const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'X7JSOMHQZTPIYDQ53VWH',
    secretAccessKey: 'stiDlHsoF5VA938FTkqk9iiRYzyEB1A6tjTJaLn+nIY'
});
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
					/*
				     var base64data = new Buffer(data0, 'binary');
				     var params = {
					 Body: base64data,
					 Bucket: "shusiou1",
					 Key: 'niu/' + f[i],
					 ContentType: 'video/mp4',
					 ACL: 'public-read'
				     };
				     */
				     var params = {
					 Bucket: "shusiou1",
					 Delete: {
				     		Objects:[
					     		{Key: 'niu/' + f[i]}
					     	]
				     	 }
				     };	
						/*
				     s3.putObject(params, function(err, data) {
					 if (err) cbk(err.message);
					 else    cbk(data);
				     });	*/				
				     s3.deleteObject(params, function(err, data) {
					 if (err) cbk(err.message + '-b-');
					 else    cbk('data');
				     }); 
				}); 
			}
		})(i)
	}	
	CP.serial(
		_f,
		function(results) {
			res.send(results);
		},
		30000
	);	
	
});  
return true;
