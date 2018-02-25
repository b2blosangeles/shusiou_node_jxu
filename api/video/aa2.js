const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let source_path = '/var/img/',
    source_file = 'video.mp4',
    tmp_folder = source_path + '_x/' + source_file + '/',
    
    space_id = 'shusiou-d-01',
    space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
    space_dir = 'shusiou/' + source_file + '/',
    trunkSize = 512 * 1024 * 10;

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

CP.serial(
	_f,
	function(results) {
		res.send(results);
	},
	300000
);	
return true;
