'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();
const fs = require('fs');
const util = require('util');
const exec = require('child_process').execSync;
var sync = require('child_process').spawnSync;

exports.handler = (event, context, callback) => {
    
  process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

  //  var bucketName = 'rubixcube';
  //  var imagefileName = 'test.png';
    var bucketName = event.bucketName;
    var imagefileName = event.imagefileName;
    
    console.log( bucketName + " " + imagefileName);
  // var params = {Bucket: 'pronovosrubixcube123', Key: 'example-abstract.pdf'};
   var params = {Bucket: bucketName, Key: imagefileName};
     var ocrText = 'ne docekuva';
    s3.getObject(params).promise().then( data => {
     // console.log("snimam na tmp");
        fs.writeFileSync("/tmp/"+imagefileName,  data.Body, 'utf8');   
          
     var vvv = exec('LD_LIBRARY_PATH=./lib TESSDATA_PREFIX=./ ./tesseract /tmp/'+imagefileName+' stdout -l eng', (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}`);
            callback('error', JSON.stringify(error));
        }
        else{
            console.log(JSON.stringify(stdout));
            callback('stdout', JSON.stringify(stdout));
          }
        });
        // });
    //  console.log(vvv);
      callback(null, JSON.stringify(vvv.toString('utf8')));
   
    });
};

      

   