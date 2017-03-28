'use strict';
var sync = require('child_process').spawnSync;
var aws = require('aws-sdk');
var s3 = new aws.S3();
const fs = require('fs');
const util = require('util');

exports.handler = (event, context, callback) => {
    
    var bucketName = event.bucketName;
    var pdffileName = event.pdffileName;
    
    console.log( bucketName + " " + pdffileName);
  // var params = {Bucket: 'pronovosrubixcube123', Key: 'example-abstract.pdf'};
   var params = {Bucket: bucketName, Key: pdffileName+".pdf"};
    
    s3.getObject(params).promise().then( data => {
     // console.log("snimam na tmp");
        fs.writeFileSync("/tmp/"+pdffileName+".pdf",  data.Body, 'utf8');   
      //  var ghs = sync('convert', ['-thumbnail', 'x300', '-background' ,'white', '-alpha', 'remove' , '/tmp/page00001.pdf','/tmp/page00001.png']);   
       var ghs = sync('convert', ['-thumbnail', 'x300', '-background' ,'white', '-alpha', 'remove' , '/tmp/'+ pdffileName +'.pdf','/tmp/'+pdffileName+'.png']);   
       
       // console.log('end gs   ' + ghs.stdout.toString());
        
        // check tmp content
        var ls = sync('ls', ['-l', '/tmp/']);
        //console.log(util.inspect(ls, false, null));
        console.log(ls.stdout.toString());
        
        // read png from /tmp/
        var fileName = "/tmp/"+pdffileName+".png";
        var pngg = fs.readFileSync(fileName ); // vraka buffer
        console.log("snimam png na s3");   
        var param = {Bucket: bucketName, Key: pdffileName +'.png', Body: pngg};
        s3.upload(param, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
        console.log('png saved: ' + pdffileName +'.png');
        // context.done();
        });
        
    callback(null, 'ok');
    
    });
};