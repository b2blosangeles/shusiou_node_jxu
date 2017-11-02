if (['video', 'section','image'].indexOf(req.query['type']) === -1) { res.send('type error '); return true; }
if (isNaN(req.query['vid']) || !parseInt(req.query['vid'])) { res.send('wrong vid'); return true; }
res.send('== ' + req.query['type'] + ' ==');


var fn = '/tmp/video_'+req.query['vid']+'.mp4';


