const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'QYF3ENCI4TEDFDWFBS6N',
    secretAccessKey: '7DJD8b9iAqD5qsLgRZH9OXfgOQMob/edWouwiqYeOwI'
});
let space_url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/', 
    trunkSize = 512 * 1024 * 10;

let l = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/_a/video.mp4/s_0.mp4';


var CP = new pkg.crowdProcess();
var _f = {}; 

_f['GET_BUCKETS'] = function(cbk) {
	var params = {
	};
	s3.listBuckets(params, function(err, data) {
		if (err) return cbk(err);
		else cbk(data);	
	});	
};
_f['GET_FOLDERS'] = function(cbk) {
	let buckets = CP.data.GET_BUCKETS.Buckets;
	var CP1 = new pkg.crowdProcess(), _f1 = {};
	for (let i = 0; i < buckets.length; i++) {
		_f1[buckets[i].Name] = (function(i) {
			return function(cbk1) {
				var params = {
					Bucket: buckets[i].Name //, 
					// MaxKeys: 2
				};
				s3.listObjects(params, function(err, data) {
					if (err) {
						return cbk1(null); 
					} else {
						let l = data.Contents, v = [];
						for (var  j = 0 ; j < l.length; j++) {
							v.push({link: space_url + '' + l[j].Key, size:l[j].Size});
						}
						return cbk1(v);       
					}
				});
			}
		})(i);
	}
	CP1.serial(
		_f1,
		function(results) {
			cbk(results.results);
		},
		60000	
	)
};

CP.serial(
	_f,
	function(results) {
		res.send(CP.data.GET_FOLDERS);
	},
	300000
);	
return true;
