	pkg.fs.exists('/var/cert/', function(exists) {
		let cmd_plus = (exists)?' && cd /var/cert/ && git pull ':'';
		var cmd = 'cd ' + env.site_path + '&& git pull && cd ' + env.root_path + '&& git pull' + cmd_plus; 	
		pkg.exec(cmd, function(error, stdout, stderr) {
			res.send(stdout);
		});
	});
