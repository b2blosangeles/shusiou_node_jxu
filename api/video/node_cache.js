if (!req.query['type']) { res.send('Missing type'); return true; }
if (req.query['type'].indexOf(['video', 'section','image']) === -1) { res.send('type error '); return true; }
res.send('== ' + req.query['type'] + ' ==');


var fn = '/tmp/video_'+req.query['vid']+'.mp4';


