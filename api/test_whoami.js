var request =  require(env.root_path + '/package/request/node_modules/request');
var diskspace = require(env.root_path + '/package/diskspace/node_modules/diskspace');
    
function getServerIP() {
    var ifaces = require('os').networkInterfaces(), address=[];
    for (var dev in ifaces) {
        var v =  ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false);
        for (var i=0; i < v.length; i++) address[address.length] = v[i].address;
    }
    return address;
};

diskspace.check('/', function (err, space)
{
    
    space.total = Math.round(space.total * 0.000001);
    space.free = Math.round(space.free * 0.000001);
    space.used = Math.round(space.used * 0.000001);

    request({
      url: 'http://root.qalet.com/api/add_node.api',
      headers: {
        "content-type": "application/json"
      },
      form:{ip:getServerIP(), space:space}
    }, function (error, resp, body) { 
            var s = {};
            try { s = JSON.parse(body); } catch (e) {}
            res.send(s.value + '--' + JSON.stringify(space));
    });
});
