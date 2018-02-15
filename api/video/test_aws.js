const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')


//Configure client for use with Spaces
 const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
 const s3 = new AWS.S3({
     endpoint: spacesEndpoint,
  accessKeyId: 'X7JSOMHQZTPIYDQ53VWH',
                      secretAccessKey: 'stiDlHsoF5VA938FTkqk9iiRYzyEB1A6tjTJaLn+nIY'
 });
             // Add a file to a Space
var params = {
    Body: "uu The contents of the file",
    Bucket: "shusiou1",
    Key: "file.html",
        ContentType: 'text/html',
//      ContentLength: res.headers['content-length'],
        ACL: 'public-read'
};

s3.putObject(params, function(err, data) {
    if (err) res.send(err.message);
    else     res.send(data);
});
