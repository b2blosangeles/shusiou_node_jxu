var total = 1024 * 1024;
res.writeHead(200, {'Content-Range': 'video/mp4' });	

let stream = require("stream"),
a = new stream.PassThrough();
a.pipe(res);

var d = Buffer.from('');
pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/video.mp4/jxu.mp4', 
function (error, response, body) {})
.on('data', function(data) {
	d = Buffer.concat([d, Buffer.from(data)]);
}).on('end', function() {
	a.write(d);
	a.end();
});
return true;
