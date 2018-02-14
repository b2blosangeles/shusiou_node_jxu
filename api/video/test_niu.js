var stream = require("stream")
var a = new stream.PassThrough();
a.pipe(res);
let g = pkg.request('https://static.pexels.com/photos/248797/pexels-photo-248797.jpeg', 
	function (error, response, body) {
});
g.on('data', function(data) {
	a.write(data);
	//a.write(new Buffer(data, 'binary'));
});
g.on('end', function(data) {
	a.end()
});
return true;
