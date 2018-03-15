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
     let goalsize = 100000000;
     list = list.sort(function(a, b) {
          return (new Date(a.mtime) > new Date(b.mtime))? 1 : -1;
     });
     let clean_list= [];
     for (var i = 0; i < list.length; i++) {
          if ((goalsize - list[i].size) > 0) {
               goalsize -= list[i].size;
               clean_list.push(list[i].fn);
          } 
     }
  //   res.send(list.length + '---' + clean_list.length);
     batchDelete(clean_list, function(data) {
          res.send(data);    
     });
});


var batchDelete = function(list, cbk) {
     let CP = new pkg.crowdProcess();
     let _f = {}, fn = []; 
     for (var i = 0; i < list.length; i++) {
          _f['P_'+i] = (function(i) {
               return function(cbk1) {
                    pkg.fs.unlink(list[i],function(err){
                         // if(err) return console.log(err);
                         cbk1('deleted ' + list[i]);
                    });                   
                    
               
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
