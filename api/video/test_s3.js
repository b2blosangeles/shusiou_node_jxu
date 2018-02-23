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

function showBuckets(s3, callback){
	var params = {
	};
	s3.listBuckets(params, function(err, data) {
		if (err) return callback(err);
		else callback(data);	
	});
}

var CP = new pkg.crowdProcess();
var _f = {}; 

_f['GET_BUCKETS'] = function(cbk) {
	showBuckets(s3, cbk);
};
_f['GET_FOLDERS'] = function(cbk) {
	let buckets = CP.data.GET_BUCKETS.Buckets;
	var params = {
		Bucket: buckets[0].Name, 
		MaxKeys: 2
	};
	s3.listObjects(params, function(err, data) {
		if (err) {
			return callback(err); 
		} else {
			return callback(data);       
		}
	});
};

CP.serial(
	_f,
	function(results) {
		res.send(CP.data.GET_FOLDERS);
	},
	300000
);	
return true;
