require(env.site_path + '/api/inc/findit/findit.js');
let seeker = new walk('/');
res.send('findit');


var finder = require(env.site_path + '/api/inc/findit/findit.js')('.');
var path = require('path');
let list = [];
finder.on('directory', function (dir, stat, stop) {
 //   var base = path.basename(dir);
 //   if (base === '.git' || base === 'node_modules') stop()
 //   else console.log(dir + '/')
});

finder.on('file', function (file, stat) {
     list.push(file);
});

finder.on('link', function (link, stat) {
    
});
finder.on('end', function (file, stat) {
     res.send('niu');
});
