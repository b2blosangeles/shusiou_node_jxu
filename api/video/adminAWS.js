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
			Delimiter: '',
			Prefix: folder
		};
		s3.listObjects(params, function(err, data) {
			   cbk(data)

		});
	}

let folder = '';

function _f(v, list) {
	let a = v.match(/(.+)\/([^\/]+)/);
	if (!a) return true;
	else {
		if (list.indexOf(a[1]) === -1) list.push(a[1]);
		_f(a[1], list);
	}	
}

browseFolder(folder , function(data) {
	let list = [];
	for (var i = 0; i < data.Contents.length; i++) {
		let a = data.Contents[i].Key.match(/(.+)\/([^\/]+)/);
		_f(data.Contents[i].Key, list);	
	}
	res.send({tm:new Date().getTime() - tm, list:list});
});

  
