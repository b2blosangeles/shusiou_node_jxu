var finder = require(env.site_path + '/api/inc/findit/findit.js')('/tmp/shusiou_cache/');
var path = require('path');
let list = [];
finder.on('directory', function (dir, stat, stop) {
});

finder.on('file', function (file, stat) {
     list.push({fn:file, created:stat.ctime, modified:stat.mtime});
});

finder.on('link', function (link, stat) {
    
});
finder.on('end', function (file, stat) {
     res.send(list);
});
