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
      watch.prev = watch.now;
      watch.now = new Date();
      res.send(watch);
    } else {
      res.send('watch error!!');
    }
  }
});	 
