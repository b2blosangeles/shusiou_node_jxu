var path = require('path');
var env = {root_path:path.join(__dirname, '../..')};
env.site_path = env.root_path + '/site';
var request =  require(env.root_path + '/package/request/node_modules/request');
var fs = require('fs');

var watch0 = {start:new Date(), prev:new Date(), now:new Date()};
fs.readFile('/var/.qalet_cron_watch.data', 'utf8', function(err,data) {
  if (err){
      fs.writeFile('/var/.qalet_cron_watch.data', JSON.stringify(watch0), function (err) {
          console.log(watch);
      });
  } else {
    var watch = {};
    try { watch = JSON.parse(data);} catch (e) {}
    
    if ((watch.prev) && (watch.now)) {
      delete watch.start;
      watch.prev = watch.now;
      watch.now = new Date();
      fs.writeFile('/var/.qalet_cron_watch.data', JSON.stringify(watch), function (err) {
          console.log(watch);
      });
    } 
  }
});	 
/*
var channel = require(env.site_path + '/api/cfg/channel.json');

function getIP() {
    var ifaces = require('os').networkInterfaces(), address=[];
    for (var dev in ifaces) {
        var v =  ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false);
        for (var i=0; i < v.length; i++) address[address.length] = v[i].address;
    }
    return address;
};
request({
    url: 'http://root.qalet.com/api/cron_watch.api',
    headers: {
      "content-type": "application/json"
    },
    form:{ip:getServerIP(), space:space}
  }, function (error, resp, body) { 
          var s = {};
          try { s = JSON.parse(body); } catch (e) {}
          process.stdout.write(s.value + '--' + JSON.stringify(space));
  });

fs.readFile('/var/.qalet_cron_watch.data', 'utf8', function(err,data) {
	if ((data) && ips.indexOf(data) != -1)  cbk(data);
	else { cbk(false); CP.exit = 1; }
});	 
*/
