'use strict';
var sync = require('child_process').spawnSync;
var aws = require('aws-sdk');
var s3 = new aws.S3();
const fs = require('fs');
const util = require('util');

exports.handler = (event, context, callback) => {
    
    var bucketName = event.bucketName;
    var folderName = event.folderName;
    var pdffileName = event.pdffileName;
    
    console.log( bucketName + " " + folderName+ " " + pdffileName);
   var params = {Bucket: bucketName, Key: folderName + pdffileName+".pdf"};
    
    s3.getObject(params).promise().then( data => {
        console.log("snimam na tmp");
        fs.writeFileSync("/tmp/"+pdffileName+".pdf",  data.Body, 'utf8');   
        var ghs = sync('convert', ['-density', '96', '-depth', '8', '-quality', '85', '/tmp/'+ pdffileName +'.pdf', '/tmp/'+pdffileName+'.png']);   


  // check tmp content
        var ls = sync('ls', ['-l', '/tmp/']);
        //console.log(util.inspect(ls, false, null));
        console.log(ls.stdout.toString());
       


        // read big tif from /tmp/
        var fileName = "/tmp/"+pdffileName+".png";
        var tiff = fs.readFileSync(fileName ); // vraka buffer
        console.log("snimam png na s3");   
        var param = {Bucket: bucketName, Key: folderName + pdffileName +'.png', Body: tiff};
        s3.upload(param, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
        console.log('big png saved: ' + pdffileName +'.png');
        // context.done();
        });


    // // comment za CROP - //  convert foo.png -crop 640x480+50+100 out.png
        var ghst = sync('convert', ['/tmp/'+ pdffileName +'.png', '-crop', '330x130+3652+2688', '/tmp/'+ pdffileName +'_crop.png' ]);   

        // check tmp content
        var ls1 = sync('ls', ['-l', '/tmp/']);
        //console.log(util.inspect(ls, false, null));
        console.log(ls1.stdout.toString());
        
        // read png from /tmp/
        var fileName1 = "/tmp/"+pdffileName+"_crop.png";
        var pngg = fs.readFileSync(fileName1 ); // vraka buffer
        console.log("snimam png na s3");   
        var param1 = {Bucket: bucketName, Key: folderName + pdffileName +'_crop.png', Body: pngg};
        s3.upload(param1, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
        console.log('_crop png saved: ' + pdffileName +'_crop.png');
        // context.done();
        });
        
    callback(null, 'ok');
    
    });
};


   