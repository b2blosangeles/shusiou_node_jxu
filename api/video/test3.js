let stream = require("stream"),
a = new stream.PassThrough();
a.pipe(res);

var total = 1024*1024;
var d = Buffer.from('');

var CP = new pkg.crowdProcess();
var _f = {}, fn = ['output000.mp4', 'output001.mp4']; 

for (var i = 0; i < fn.length; i++) {
	_f['P_' + i] = (function(i) {
		return function(cbk) {
			let d = Buffer.from('');
			pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/' + fn[i], 
			function (error, response, body) {})
			.on('data', function(data) {
				d = Buffer.concat([d, Buffer.from(data)]);
			}).on('end', function() {
				cbk1(d);
			});
		}
	})(i);	
}

/*
pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output001.mp4', 
function (error, response, body) {})
.on('data', function(data) {
	d = Buffer.concat([d, Buffer.from(data)]);
	//a.write(Buffer.from(data));
}).on('end', function() {
	a.write(d);
	 a.end();
});
*/
//    var x = pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output001.mp4');
//    req.pipe(x)
 //   x.pipe(res)

req.pipe(pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output001.mp4')).pipe(res);

/*
pkg.request
  .get('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output000.mp4')
  .on('response', function(response) {
//    console.log(response.statusCode) // 200
 //   console.log(response.headers['content-type']) // 'image/png'
  })
  .pipe(res);

*/
//var file = pkg.fs.createReadStream('/var/img/video.mp4', {start:0, end:1024*1024});
//file.pipe(res);
