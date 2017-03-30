'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();
const fs = require('fs');
 const util = require('util');
 const exec = require('child_process').execSync;
var sync = require('child_process').spawnSync;

exports.handler = (event, context, callback) => {
    
  process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];
    var bucketName = event.bucketName;
    var imagefileName = event.imagefileName;
    var params = {Bucket: bucketName, Key: imagefileName};
     var ocrText = 'ne docekuva';
    s3.getObject(params).promise().then( data => {
      fs.writeFileSync("/tmp/"+imagefileName,  data.Body, 'utf8');   
      var ghs = sync('LD_LIBRARY_PATH=./lib TESSDATA_PREFIX=./ ./tesseract', ['/tmp/'+imagefileName, 'stdout', '-l', 'eng'], { shell : true });     
      console.log(ghs.stdout.toString('utf8'));
      callback(null,  JSON.stringify(ghs.stdout.toString('utf8')));
    });
};

      

   