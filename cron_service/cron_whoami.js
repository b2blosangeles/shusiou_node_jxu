/* --- code for who am I watch ---*/

var path = require('path');
var env = {root_path:path.join(__dirname, '../..')};

env.site_path = env.root_path + '/site';
env.config_path = '/var/qalet_config';

var request =  require(env.root_path + '/package/request/node_modules/request');
var diskspace = require(env.root_path + '/package/diskspace/node_modules/diskspace');

var channel = require(env.site_path + '/api/cfg/channel.json');

function getServerIP() {
    var ifaces = require('os').networkInterfaces(), address=[];
    for (var dev in ifaces) {
        var v =  ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false);
        for (var i=0; i < v.length; i++) address[address.length] = v[i].address;
    }
    return address;
};

diskspace.check('/', function (err, space) {
    space.total = Math.round(space.total * 0.000001);
    space.free = Math.round(space.free * 0.000001);
    space.used = Math.round(space.used * 0.000001); 
    space.free_rate =  Math.floor(space.free  * 100 /  space.total); 
    space.channel = channel.channel;
    request({
      url: 'http://' + env.config_path + '/api/add_node.api',
      headers: {
        "content-type": "application/json"
      },
      form:{ip:getServerIP(), space:space}
    }, function (error, resp, body) { 
          console.log('---body1--');
                 console.log(body);
            var s = {};
            try { s = JSON.parse(body); } catch (e) {}
            process.stdout.write(s.value + '--' + JSON.stringify(space));
    });
});

/* --- code for cron watch ---*/
(function(){
      var path = require('path');
      var env = {root_path:path.join(__dirname, '../..')};
      env.site_path = env.root_path + '/site';
      var request =  require(env.root_path + '/package/request/node_modules/request');
      var fs = require('fs');

      var watch0 = {start:new Date(), mark:new Date()};
      fs.readFile('/var/.qalet_cron_watch.data', 'utf8', function(err,data) {
        if (err){
            fs.writeFile('/var/.qalet_cron_watch.data', JSON.stringify(watch0), function (err) {});
        } else {
          var watch = {};
          try { watch = JSON.parse(data);} catch (e) {}
          if (watch.mark)  {
            delete watch.start;
            watch.mark = new Date();
            fs.writeFile('/var/.qalet_cron_watch.data', JSON.stringify(watch), function (err) {
                console.log(watch);
            });
          } 
        }
      });	 

      function randomInt(min,max) {
          return Math.floor(Math.random()*(max-min+1)+min);
      }
      var delay = randomInt(0,300) * 10;
      setTimeout(
        function() {
            request({
              url: 'http://'+ env.config_path +'/api/cron_watch.api',
              headers: {
                "content-type": "application/json"
              },
              form:{}
            }, function (error, resp, body) { 
                console.log('---body--http://' + env.config_path + '/api/add_node.api');
                 console.log(body);
                console.log('');
                console.log(delay + '--' + body);
                console.log('');
            });
        }, delay
      );
})();
