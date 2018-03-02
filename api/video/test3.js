let CP = new pkg.crowdProcess();
let _f = {}, fn = ['output000.mp4', 'output001.mp4']; 
let dirn = '/tmp/img';

_f['WRITE_TXT'] = function(cbk) {
	var str = '';
	for (var i = 0; i < fn.length; i++) {
		str += "file '" + 'M_' + i + ".mp4'\n";
	}
	pkg.fs.writeFile(dirn + 'engine.data', str, function(err) {	    
		cbk('niu');
	}); 
};
CP.serial(_f,
	function(results) {
		res.send(results);
	}, 8000);
return true;

var CP1 = new pkg.crowdProcess();
var _f1 = {}; 

for (var i = 0; i < fn.length; i++) {
	_f1['P_' + i] = (function(i) {
		return function(cbk) {
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
CP1.parallel(
_f1,
function(results) {
	res.send(results);
}, 8000);
