	const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
	const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
	const s3 = new AWS.S3({
	    endpoint: spacesEndpoint,
	    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
	    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
	});

	let tm = new Date().getTime();

	function browseFolder(folder, cbk){
		var params = {
			Bucket: 'shusiou-d-01',
			Delimiter: '/',
			Prefix: folder
		};
		s3.listObjects(params, function(err, data) {
			   cbk(data)

		});
	}

let folder = '/shusiou/';
  
  browseFolder(folder, function(data) {
	  
    res.send({tm:new Date().getTime() - tm,data:data});
  });
  
  
