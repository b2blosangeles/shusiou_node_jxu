if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
if (isNaN(req.query['vid']) || !parseInt(req.query['vid'])) { res.send('wrong vid'); return true; }
if (!req.query['host']) { res.send('missing host'); return true; }

var vid = req.query['vid'];

var mnt_folder = '/var/shusiou-video/videos/', 
    info_folder = '/var/shusiou-video/info/',
    fn, fd, info_fn, info_fd;

if (req.query['type'] =='video') {
    fd = mnt_folder +  + vid + '/video/';
    info_fd = info_folder +  + vid + '/video/';
    fn = fd + 'video.mp4';
    info_fn = info_fd + 'video.json'
}

if (req.query['type'] =='section') {
    if (isNaN(req.query['s']) || !parseInt(req.query['s'])) { res.send('wrong s'); return true; }
    if (isNaN(req.query['l']) || !parseInt(req.query['l'])) { res.send('wrong l'); return true; }
    fd = mnt_folder +  + vid + '/sections/';
    info_fd = info_folder +  + vid + '/sections/';    
    fn = fd+ req.query['s']+'_'+req.query['l']+'.mp4';
    info_fn = info_fd + req.query['s']+'_'+req.query['s'] + '.json'
}

if (req.query['type'] =='image') {
    if (['FULL', '90', '180', '480'].indexOf(req.query['w']) === -1) { res.send('wrong w'); return true; }
    if (isNaN(req.query['s']) || !parseInt(req.query['s'])) { res.send('wrong s'); return true; }
    fd = mnt_folder +  + vid + '/images/';
    info_fd = info_folder +  + vid + '/images/';     
    
    fn = fd+req.query['w']+'_'+req.query['s']+'.png';
    info_fn = info_fd +req.query['w']+'_'+req.query['s']+'.json'
}

var CP = new pkg.crowdProcess();
// var folderP = require(env.site_path + '/api/inc/folderP/folderP');
var request = require(env.root_path + '/package/request/node_modules/request');
var http = require('http');
var tm =  new Date().getTime();

var _f = {};
_f['I0'] = function(cbk) { /* --- check mnt exist --- */
	pkg.fs.stat(info_fn, function (err, stats){
		if (err) { 
			var request = http.get('http://'+req.query['host']+'/api/video/hub_info.api?fn='+fn, function(response) {
				cbk(response);
			});
			request.post({
				headers: {'content-type' : 'application/x-www-form-urlencoded'},
				url:     'http://'+req.query['host']+'/api/video/hub_info.api?fn='+fn,
				body:    "mes=heydude"
			}, function(error, response, body){
				cbk(body);
			});			

		} else {
		     cbk(true);
		}
	});
};
CP.serial(
	_f,
	function(data) {
		res.send(data);
	},
	6000
);
