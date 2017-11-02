if (!req.query['type']) { res.send('Missing type'); return true; }
if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
res.send('== ' + req.query['type'] + ' ==');


var fn = '/tmp/video_'+req.query['vid']+'.mp4';


