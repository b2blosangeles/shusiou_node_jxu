var CP = new pkg.crowdProcess();
var _f = {}, fn = ['output000.mp4', 'output001.mp4']; 

for (var i = 0; i < fn.length; i++) {
	_f['P_' + i] = (function(i) {
		return function(cbk) {
			//cbk(i);
			//return truel
			let url = 'https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/' + fn[i];
			let file = pkg.fs.createWriteStream('/var/img/M_' + i + '.mp4');
			file.on('finish', function() {
				file.close(function() {
					cbk(fn[i]);
				});  
			});
			pkg.request(url, function (error, response, body) {
			}).pipe(file);			      
		}
	})(i);	
}
CP.parallel(
	_f,
	function(results) {
		res.send(results);
	}, 8000);
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

// req.pipe(pkg.request('https://shusiou-d-01.nyc3.digitaloceanspaces.com/shusiou/v/output001.mp4')).pipe(res);

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
