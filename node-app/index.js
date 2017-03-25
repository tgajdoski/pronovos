
var inspect = require('eyespect').inspector({maxLength:20000});
var path = require('path');
//var should = require('should');
var assert = require('assert');
var fs = require('fs');
var async = require('async');

var convertMod = require('./lib/convert');
var split = require('./lib/split.js');

// var AWS = require("aws-sdk");

//AWS.config.update({accessKeyId: 'AKIAI7PRX6Q7WRTIVC3A', secretAccessKey: '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'});

var s3 = require('s3');

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: "AKIAI7PRX6Q7WRTIVC3A",
    secretAccessKey: "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",
    region: "us-west-2"
  },
});


var params = {
  localFile: "./uploads/file-1490454379944.pdf",

  s3Params: {
    Bucket: "pronovosrubixcube123",
    Key: "file-1490454379944.pdf"
  },
};
var uploader = client.uploadFile(params);
uploader.on('error', function(err) {
  console.error("unable to upload:", err.stack);
});
uploader.on('progress', function() {
  console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', function() {
  console.log("done uploading");
});
// // ispali lambda za THUMBNAILS

//  AWS.config.update({accessKeyId: 'AKIAIG5DVR42CZZVGTVQ', secretAccessKey: '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'});
// for (var i=0;i<24;i++){

//    var lambda = new AWS.Lambda({region: 'us-west-2', apiVersion: '2015-03-31'});
  
//    temppdfName = 'page000';
//    if (i<10)
//         temppdfName +='0'+ i.toString()
//     else
//         temppdfName += i.toString();
//   var args = {
//       bucketName: 'pronovosrubixcube123',
//       pdffileName: temppdfName
//   }

//     var params = {
//         FunctionName: 'arn:aws:lambda:us-west-2:001625110443:function:pdf2Thumb', /* required */
//         Payload:  JSON.stringify(args)
//     };
//     lambda.invoke(params, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else     console.log(data);           // successful response
//     });

// }



// https://github.com/nisaacson/pdf-extract
// DA SE SPLITUVA PDF-OT

    // var file_name = 'Bellevue Office Tower Archs.pdf';
    // var relative_path = path.join('uploads',file_name);
    // console.log(__dirname);
    // var pdf_path = path.join(__dirname, relative_path);
    // console.log (relative_path);
    // console.log ("pdf_path : " + pdf_path);
    
    // split(pdf_path, function (err, output) {
    //   // console.log(err);
    //   // console.log(output);
    // });



// DA SE KONVERTIRA OD PDF VO TIF
 // convert('./test/test_data/multipage_searchable.pdf', function (err, tif_path) {
//  convertMod.convertThumsPdf('./test/test_data/single_page_raw.pdf', function (err, tif_path) {
//         console.log(err);
//          console.log(tif_path);
//  });


// fs.readFile('./uploads/split/file-1489413601113/doc_data.txt', function(err, data) {
//     if(err) throw err;
//     var array = data.toString().split("\n");
//     var num = 0; 
//     var arrayFinal =  [];
//     for(var i in array) {
//         if (array[i].startsWith('BookmarkTitle:') )
//         {
//             num++;
//           arrayFinal.push(array[i].replace('BookmarkTitle:', ''));
//         }
//     }
//     for(var i in arrayFinal) {
//        console.log(arrayFinal[i]);
//     }
// });

 