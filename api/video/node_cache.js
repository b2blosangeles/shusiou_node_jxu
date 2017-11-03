if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
if (isNaN(req.query['vid']) || !parseInt(req.query['vid'])) { res.send('wrong vid'); return true; }
if (!req.query['host']) { res.send('missing host'); return true; }

var vid = req.query['vid'];

var mnt_folder = '/var/shusiou-video/', 
    fn, fd, info_fn, info_fd;

if (req.query['type'] =='video') {
    fd = mnt_folder + 'videos/' + vid + '/video/';
    info_fd = mnt_folder + 'info/' + vid + '/video/';
    fn = fd + 'video.mp4';
    info_fn = info_fd + 'video.json'
}

if (req.query['type'] =='section') {
    if (isNaN(req.query['s']) || !parseInt(req.query['s'])) { res.send('wrong s'); return true; }
    if (isNaN(req.query['l']) || !parseInt(req.query['l'])) { res.send('wrong l'); return true; }
    fd = mnt_folder + 'videos/' + vid + '/sections/';
    info_fd = mnt_folder + 'info/' + vid + '/sections/';    
    fn = fd+ req.query['s']+'_'+req.query['l']+'.mp4';
    info_fn = info_fd + req.query['s']+'_'+req.query['s'] + '.json'
}

if (req.query['type'] =='image') {
    if (['FULL', '90', '180', '480'].indexOf(req.query['w']) === -1) { res.send('wrong w'); return true; }
    if (isNaN(req.query['s']) || !parseInt(req.query['s'])) { res.send('wrong s'); return true; }
    fd = mnt_folder + 'videos/' + vid + '/images/';
    info_fd = mnt_folder + 'info/' + vid + '/images/';     
    
    fn = fd+req.query['w']+'_'+req.query['s']+'.png';
    info_fn = info_fd +req.query['w']+'_'+req.query['s']+'.json'
}

var CP = new pkg.crowdProcess();
var folderP = require(env.site_path + '/api/inc/folderP/folderP');
var request = require(env.root_path + '/package/request/node_modules/request');
var http = require('http');
var tm =  new Date().getTime();

var _f = {};
_f['I0'] = function(cbk) { /* --- get catch info --- */
	pkg.fs.readFile(info_fn, 'utf-8', function (err, data){
		var pull_hub_info = function() {
			request.post({
				url:     'http://'+req.query['host']+'/api/video/hub_info.api',
				form:{ fn: fn.replace(mnt_folder,'') }, 
			}, function(error, response, body){
				var v = {};
				try { v = JSON.parse(body); } catch(e) { }
				var fp = new folderP();
				fp.build(info_fd, function() {
					if (v.status == 'success' && v.size > 0) {
						pkg.fs.writeFile(info_fn, JSON.stringify(v), function (err) {
							if (err) cbk({status:'error'});
							else cbk(v);
						});
					} else {
						cbk({status:'error'});
					}
				});				
			
				
			});		
		}
		if (err) { 
			pull_hub_info();	

		} else {
			var v = {};
			try { v = JSON.parse(data); } catch(e) { }
			if (v.status == 'success' && v.size > 0) {
				v.cache = true; cbk(v);
			} else {
				pull_hub_info();
			}
		}
	});
};

_f['I1'] = function () {
	if (CP.data.I0.status == 'success' && CP.data.I0.size > 0) {
		cbk(CP.data.I0);
	} else {
		cbk(false);
	}
};
CP.serial(
	_f,
	function(data) {
		res.send(data);
	},
	6000
);
