if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
if (!isNaN(req.query['vid']) || !parseInt(req.query['vid'])) { res.send('wrong vid'); return true; }

var mnt_folder = '/var/shusiou-video/videos/';
var target_folder = mnt_folder +  + vid + '/' + req.query['type'] + '/';

res.send('== ' + target_folder + ' ==');


var fn = '/tmp/video_'+req.query['vid']+'.mp4';


