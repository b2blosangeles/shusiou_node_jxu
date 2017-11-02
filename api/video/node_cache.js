res.send('==niu==');
return true;
if (!req.query['vid']) {
	res.send('vid error ');
	return true;
}
var channel = (req.query['channel'])?parseInt(req.query['channel']):0;

var fn = '/tmp/video_'+req.query['vid']+'.mp4';


