
function trackAws(_type, _file, _cbk)  {
	let _p = _file.match(/(.+)\/([^\/]+)$/);
	
	const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
	const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
	const s3 = new AWS.S3({
	    endpoint: spacesEndpoint,
	    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
	    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
	});
	let source_path = _p[1] + '/',
	    source_file = _p[2],
	    tmp_folder = '/var/shusiou_cache/tmpvideo/' + source_file + '/' + _type + '/',

	    space_id = 'shusiou-d-01',
	    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
	    space_info = 'shusiou/' + source_file + '/_info.txt',
	    space_dir = 'shusiou/' + source_file + '/' + _type + '/',
	    trunkSize = 1024 * 1024;

	let tm = new Date().getTime();
	var CP = new pkg.crowdProcess();
	var _f = {}; 

	function removeFolder(folder, callback){
		var params = {
			Bucket: space_id,
			Prefix: folder
		};
		s3.listObjects(params, function(err, data) {
      callback(data);
      /*
			if (err) return callback(err);
			if (data.Contents.length == 0) callback({"Deleted":[],"Errors":[]});
			var params = {
				Bucket: space_id
			};		
			params.Delete = {Objects:[]};
			data.Contents.forEach(function(content) {
				params.Delete.Objects.push({Key: content.Key});
			});
			s3.deleteObjects(params, function(err, d) {
				if (err) return callback(err);
				else callback(d);
			});
      */
		});
	}

  
  removeFolder(space_dir+'_m', function(data) {
    res.send(data);
  });
  
  
