// var total = 1024 * 1024;
	

let stream = require("stream"),
a = new stream.PassThrough();
a.pipe(res);
var total = 3265695;
res.writeHead(206, {'Content-Range': 'bytes ' + 0 + '-' + (total-1) + '/' + total, 
    'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
// res.writeHead(200, { 'Content-Type': 'video/mp4' });

var d = Buffer.from('');
pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output000.mp4', 
function (error, response, body) {})
.on('data', function(data) {
	d = Buffer.concat([d, Buffer.from(data)]);
}).on('end', function() {
	/*
	pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output001.mp4', 
	function (error1, response1, body1) {}).
	on('data', function(data1) {
		d = Buffer.concat([d, Buffer.from(data1)]);
	}).on('end', function() {	
		pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output002.mp4', 
		function (error2, response2, body2) {}).
		on('data', function(data2) {
			d = Buffer.concat([d, Buffer.from(data2)]);
		}).on('end', function() {	
			a.write(d);
			a.end();
		});
	});
	*/
	 a.write(d);
	 a.end();
});
return true;
