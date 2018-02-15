const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'X7JSOMHQZTPIYDQ53VWH',
    secretAccessKey: 'stiDlHsoF5VA938FTkqk9iiRYzyEB1A6tjTJaLn+nIY'
});
pkg.fs.readdir('/var/img/x/', (err, files) => {
	var f = [];
	files.forEach(file => {
		// if (/x([a-z]+)/.test(file)) 
		f[f.length] = file;
	});
	res.send(f);
});  
return true;
pkg.fs.readFile('/var/img/x/xab', function (err, data0) {
  if (err) { throw err; }
     var base64data = new Buffer(data0, 'binary');
     //Configure client for use with Spaces

                  // Add a file to a Space
     var params = {
         Body: base64data,
         Bucket: "shusiou1",
         Key: "xab",
         ContentType: 'image/jpg',
  //      ContentLength: res.headers['content-length'],
         ACL: 'public-read'
     };

     s3.putObject(params, function(err, data) {
         if (err) res.send(err.message);
         else     res.send(data);
     }); 
}); 

