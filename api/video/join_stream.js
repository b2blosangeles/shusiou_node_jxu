var mnt_folder = '/mnt/shusiou-video/';

var config = require(env.config_path + '/config.json');

var folderP = require(env.site_path + '/api/inc/folderP/folderP');

var file = pkg.fs.createReadStream('/var/img/_x/video.aa');
file.pipe(res);
file.on('close', function(){ 									
});	

