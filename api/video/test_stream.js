var stream = require("stream")
var a = new stream.PassThrough();
a.pipe(res);
let g = pkg.request('https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?w=1260&h=750&auto=compress&cs=tinysrgb', 
	function (error, response, body) {
});
g.on('data', function(data) {
	a.write(new Buffer(data, 'binary'));
});
g.on('end', function(data) {
	a.end()
});
return true;
