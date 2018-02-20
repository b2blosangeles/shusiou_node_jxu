var config = require(env.config_path + '/config.json');
var folderP = require(env.site_path + '/api/inc/folderP/folderP');

var file = pkg.fs.createReadStream('/var/img/_x/video.mp4/aa');
file.pipe(res);
file.on('close', function(){ 									
});	

