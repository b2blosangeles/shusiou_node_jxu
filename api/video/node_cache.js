
if (req.query['type'].indexOf(['video', 'section','image'])) { res.send('type error '); return true; }
res.send('== ' + req.query['type'] + ' ==');


var fn = '/tmp/video_'+req.query['vid']+'.mp4';


