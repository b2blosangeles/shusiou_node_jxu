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
	let list = ["shusiou/75600000000001"], full_list = [];
	for (var i = 0; i < data.Contents.length; i++) {
		_f(data.Contents[i].Key, list);
		full_list.push(data.Contents[i].Key);
	}
	let full_list2 = full_list.concat(list);
	
	let full_list_ASC = list.sort(function(x, y){   
		let xa = x.split('/'), ya = y.split('/');
		for (var i = 0; i < xa.length; i++) {
			if (!ya[i] || xa[i] > ya[i]) return true;
			
		}
  		return false;
		});
	
	res.send({tm:new Date().getTime() - tm, list:list});
});

  
