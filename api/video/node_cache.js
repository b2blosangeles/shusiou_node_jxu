if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
if (isNaN(req.query['vid']) || !parseInt(req.query['vid'])) { res.send('wrong vid'); return true; }

var vid = req.query['vid'];

var mnt_folder = '/var/shusiou-video/videos/', 
    info_folder = '/var/shusiou-video/info/',
    fn;

if (req.query['type'] =='video') {
    fn = mnt_folder +  + vid + '/' + req.query['type'] + '/video.mp4';
    info_fn = info_folder +  + vid + '/' + req.query['type'] + '/video.json'
}

if (req.query['type'] =='section') {
    fn = mnt_folder +  + vid + '/sections/---.mp4';
    info_fn = info_folder +  + vid + '/sections/---.json'
}

if (req.query['type'] =='image') {
    if (isNaN(req.query['w']) || !parseInt(req.query['w'])) { res.send('wrong w'); return true; }
    if (isNaN(req.query['s']) || !parseInt(req.query['s'])) { res.send('wrong s'); return true; }
    fn = mnt_folder +  + vid + '/images/---.png';
    info_fn = info_folder +  + vid + '/images/.info'
}




res.send('== fn ' + fn + '--info_fn--' + info_fn + ' ==');


var fn = '/tmp/video_'+req.query['vid']+'.mp4';


