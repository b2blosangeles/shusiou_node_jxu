var finder = require(env.site_path + '/api/inc/findit/findit.js')('/tmp/shusiou_cache/');
var path = require('path');
let list = [];
finder.on('directory', function (dir, stat, stop) {
});

finder.on('file', function (file, stat) {
     if (!file.match(/\.txt$/)) {
          list.push({fn:file, mtime:stat.mtime, size:stat.size});
     }     
});

finder.on('link', function (link, stat) {
    
});
finder.on('end', function (file, stat) {
     
     list = list.sort(function(a, b) {
          return (new Date(a.mtime) > new Date(b.mtime))? 1 : -1;
     });
     let clean_list= [];
     let goalsize = 10000;
     
     var diskspace = require(env.root_path + '/package/diskspace/node_modules/diskspace');
     diskspace.check('/', function (err, space) {
         space.free_rate =  Math.floor(space.free  * 100 /  space.total); 
          if  (space.free < goalsize) {
               for (var i = 0; i < list.length; i++) {

                    if ((goalsize - list[i].size) > 0) {
                         goalsize -= list[i].size;
                         clean_list.push(list[i].fn);
                    } 
               }
               batchDelete(clean_list, function(data) {
                    data.space = space;
                    res.send(data);    
               });                
          }          
          res.send(space);
     });	

});

var batchDelete = function(list, cbk) {
     let CP = new pkg.crowdProcess();
     let _f = {}, fn = []; 
     for (var i = 0; i < list.length; i++) {
          _f['P_'+i] = (function(i) {
               return function(cbk1) {
                  //  pkg.fs.unlink(list[i],function(err){
                         cbk1('deleted ' + list[i]);
                  //  });
               } 
          })(i);
     }
     CP.serial(
          _f,
          function(result) {
               cbk(result);
          }, 30000
     )
}
