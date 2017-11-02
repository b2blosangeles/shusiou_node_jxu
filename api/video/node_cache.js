if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
if (isNaN(req.query['vid']) || !parseInt(req.query['vid'])) { res.send('wrong vid'); return true; }

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




res.send('== fn ' + fn + '--info_fn--' + info_fn + ' ==');


var fn = '/tmp/video_'+req.query['vid']+'.mp4';


