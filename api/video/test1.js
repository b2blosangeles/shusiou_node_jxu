var total = 1024 * 1024;
	

let stream = require("stream"),
a = new stream.PassThrough();
a.pipe(res);
var total = 1024 * 1024 * 2;
res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + total + '/' + total, 
    'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });

var d = Buffer.from('');
pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/video.mp4/jxu.mp4', 
function (error, response, body) {})
.on('data', function(data) {
	d = Buffer.concat([d, Buffer.from(data)]);
}).on('end', function() {
	pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/video.mp4/ab', 
	function (error1, response1, body1) {}).
	on('data', function(data1) {
		d = Buffer.concat([d, Buffer.from(data1)]);
	}).on('end', function() {	
		a.write(d);
		a.end();
	});	
});
return true;
