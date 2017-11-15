pkg.fs.readFile('/var/.qalet_cron_watch.data', 'utf8', function(err,data) {
  if (err){
      res.send(err.message);
  } else {
    var watch = {};
    try { watch = JSON.parse(data);} catch (e) {}
    if (watch.start) {
      res.send('skip!');
    } else if ((watch.prev) && (watch.now)) {
      delete watch.start;
      var prev = new Date(watch.prev).getTime(), now = new Date(watch.now).getTime(), d = now - prev;
      if (d > 180000) {
        res.send('need reboot');
      } else {
        res.send('normal');
      }
    } else {
      res.send('watch error!!');
    }
  }
});	 
