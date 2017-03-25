var express = require('express');
var request = require('request');
// var http = require("http");
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');

var inspect = require('eyespect').inspector({maxLength:20000});
var path = require('path');
var assert = require('assert');
var fs = require('fs');
var async = require('async');

var convertMod = require('./lib/convert.js');
var split = require('./lib/split.js');
require( 'dotenv' ).load();

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var url = require('url');

  var AWS = require("aws-sdk");
  AWS.config.update({accessKeyId: 'AKIAI7PRX6Q7WRTIVC3A', secretAccessKey: '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'});
//  var s3 = new AWS.S3({apiVersion: '2006-03-01'});


mongoose.connect('mongodb://localhost:27017/files', function (err, connect) {
    if (err) 
        console.log("connection err", err);
    else 
        console.log("Connection Successfulll......");
    }
);

app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

/** Serving from the same express Server
    No cors required */
app.use(express.static('../client'));
//app.use(express.static('./uploads/split'));
app.use("/uploads",express.static('./uploads'));

app.use(bodyParser.json());


// var storage = s3({
//     destination : function( req, file, cb ) {     
//         cb( null, 'multer-uploads/my-files' );
//     },
//     filename    : function( req, file, cb ) {
//         cb( null, file.fieldname + '-' + Date.now() );
//     },
//     bucket      : 'pronovosrubixcube123',
//     region      : 'us-west-2'
// });

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[
            file
                .originalname
                .split('.')
                .length - 1
        ]);
    }
});



var Schema = mongoose.Schema;
var fileSchema = new Schema({
    type: Schema.Types.ObjectId,
    fieldname: {
        type: String
    },
    originalname: {
        type: String
    },
    encoding: {
        type: String
    },
    mimetype: {
        type: String
    },
    destination: {
        type: String
    },
    filename: {
        type: String
    },
    path: {
        type: String
    },
    size: {
        type: Number
    },
    uploadDate: {
        type: Date
    }
});

var fileModel = mongoose.model('files', fileSchema);

var upload = multer({ //multer settings
    storage: storage
}).single('file');

var datetimestamp = Date.now();


// upload to s3 from local ./uploads folder - after file is uploaded to node-app inside uploads
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


/** API path that will upload the files */
app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        // console.log(req.file);
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        } else {

            

            // ako nema greska postioraj za da zapisis vo mongodb spremi fileModel object
            var singleFile = new fileModel();
            singleFile.fieldname = req.file.fieldname;
            singleFile.originalname = req.file.originalname;
            singleFile.encoding = req.file.encoding;
            singleFile.mimetype = req.file.mimetype;
            singleFile.destination = req.file.destination;
            singleFile.filename = req.file.filename;
            singleFile.path = req.file.path;
            singleFile.size = req.file.size;
            singleFile.uploadDate = new Date();

            var myJSONObject = JSON.stringify(singleFile);

            // ovoj del sakam da kopira nakaj s3  - se pravat params
            var locpath = "./uploads/"+req.file.filename;
            var params = {
                localFile: "./uploads/"+req.file.filename,
                s3Params: {
                    Bucket: "pronovosrubixcube123",
                    Key: req.file.filename
                },
            };
            var uploader = client.uploadFile(params);
            // uploader.on('error', function(err) {
            // console.error("unable to upload:", err.stack);
            // });
            // uploader.on('progress', function() {
            // console.log("progress", uploader.progressMd5Amount,
            //             uploader.progressAmount, uploader.progressTotal);
            // });
            uploader.on('end', function() {
               //    fs.unlinkSync(locpath);
                 console.log("done uploading  " + locpath);
            });

            // do tuka treba da e iskopiran na S3 veke


            // ovoj del e za da se snimi vo mongoDB so post kon /files i so parametrite 
            // Set the headers
            var headers = {
                'Content-Type': 'application/json'
            };

            // Configure the request
            var options = {
                uri: 'http://localhost:3001/files',
                method: 'POST',
                headers: headers,
                body: myJSONObject
            };

            // Start the request
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // Print out the response body
                 //   console.log(body);
                    res.json({error_code: 0, err_desc: null});
                } else {
                    console.log(error);
                    res.json({error_code: 1, err_desc: error});
                }
            });

            //res.json({error_code: 0, err_desc: null});
        }
    });
});


app.post('/files', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    var singleFile = new fileModel();

    console.log(req.body);
    //  console.log(req.body.data);
    var jsonData = req.body;
    // ako ne e veke object zavisi sto isprakame var jsonData =
    // JSON.parse(req.body.data);

    singleFile.fieldname = jsonData.fieldname;
    singleFile.originalname = jsonData.originalname;
    singleFile.encoding = jsonData.encoding;
    singleFile.mimetype = jsonData.mimetype;
    singleFile.destination = jsonData.destination;
    singleFile.filename = jsonData.filename;
    singleFile.path = jsonData.path;
    singleFile.size = jsonData.size;
    singleFile.uploadDate = new Date();

    //   console.log("POVIKAN SUM " + singleFile);

    singleFile.save(function (err, result) {
        if (err)
            console.log(err);
      //  console.log(result);
        res.json(result);
    });
});

app.get('/files', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    fileModel
        .find({}, function (err, result) {
            res.json(result);
        });
});

app.get('/files/:start/:limit', function (req, res, next) {
    var start = req.params.start;
    var limit = req.params.limit;

    console.log("Start : ", start, "Type of Start : ", typeof start);
    // res.header("Access-Control-Allow-Origin", "*");
    fileModel.count({}, function (err, totalCount) {
        fileModel
            .find({}, function (err, result) {
                var endResult = {
                    totalCount: totalCount,
                    data: result
                };
                res.json(endResult);
            })
            .skip(parseInt(start))
            .limit(parseInt(limit));
    });

});

app.get('/files/:fileId', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    fileId = req.params.fileId;
    fileModel.findOne({
        '_id': fileId
    }, function (err, result) {
        res.json(result);
    });
});

app.put('/files/:fileId', function (req, res, next) {
    // res.header('Access-Control-Allow-Origin: *');
    // res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE,
    // OPTIONS'); res.header('Access-Control-Allow-Headers: Origin, Content-Type,
    // X-Auth-Token'); if ('OPTIONS' == req.method) {   res.send(200); }

    var jsonData = JSON.parse(req.body.data);

    fileId = req.params.fileId;
    fileModel.findOne({
        '_id': req.params.fileId
    }, function (err, singleFile) {
        singleFile.fieldname = jsonData.fieldname;
        singleFile.originalname = jsonData.originalname;
        singleFile.encoding = jsonData.encoding;
        singleFile.mimetype = jsonData.mimetype;
        singleFile.destination = jsonData.destination;
        singleFile.filename = jsonData.filename;
        singleFile.path = jsonData.path;
        singleFile.size = jsonData.size;
        singleFile.uploadDate = new Date();

        singleFile.save(function (err, result) {
            res.json(result);
        });
    });
});

app.put('/files', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    var jsonData = JSON.parse(req.body.data);
    fileId = jsonData.fileId;
    fileModel.findOne({
        '_id': jsonData.employeeid
    }, function (err, singleFile) {
        singleFile.fieldname = jsonData.fieldname;
        singleFile.originalname = jsonData.originalname;
        singleFile.encoding = jsonData.encoding;
        singleFile.mimetype = jsonData.mimetype;
        singleFile.destination = jsonData.destination;
        singleFile.filename = jsonData.filename;
        singleFile.path = jsonData.path;
        singleFile.size = jsonData.size;
        singleFile.uploadDate = new Date();

        singleFile.save(function (err, result) {
            res.json(result);
        });
    });
});

app.delete('/files/:fileId', function (req, res, next) {
    // res.header('Access-Control-Allow-Origin: *');
    // res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE,
    // OPTIONS'); res.header('Access-Control-Allow-Headers: Origin, Content-Type,
    // X-Auth-Token');
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        fileId = req.params.fileId;
        fileModel.remove({
            '_id': fileId
        }, function (err, result) {
            res.json(result);
        });
    }

});


app.get('/split/:filename', function (req, res, next) {
    var file_name =  req.params.filename;
    var relative_path = path.join('uploads',file_name);
    // console.log(file_name);
    // console.log(relative_path);
    var pdf_path = path.join(__dirname, relative_path);
    var filenoExt = file_name.replace(/\.[^/.]+$/, "");

    console.log(filenoExt);
    
    split(pdf_path, filenoExt, function (err, output) {
       //  console.log(err);
    //     console.log(output);
  // otkako ke issplituva se pravi folder so isto ime kako fajlot bez nastavka
        var fpath = './uploads/split/' + filenoExt;

        fs.readdir(fpath, function(error, filelist) {
            if (error) {
                throw error;
            }
            else {
                var itemsProcessed = 0;
                filelist.forEach(file => { 
                    var params = {
                    localFile: "./uploads/split/"+ filenoExt +"/" + file,
                    s3Params: {
                        Bucket: "pronovosrubixcube123",
                        Key: "split/" +filenoExt +"/" + file
                        } 
                    };
                    var uploader = client.uploadFile(params);
                    uploader.on('end', function() {
                        console.log("done uploading  "+ params);
                        itemsProcessed++;
                        console.log(itemsProcessed);
                        if(itemsProcessed === filelist.length) {
                        console.log("krajot e tuka");
                        res.json(filelist);
                    }
                    });
                    
                    
                 });  
            }
            });
            //   if (err){
            //             throw error;
            //         }
            //         else {
            //             res.json(output);
            //         }

    });


  
});


app.get('/createthumb/:filename', function (req, res, next) {
    //ova e za lokalno da se pravat THUMBS
//     var file_name =  req.params.filename;
//     var relative_path = path.join('uploads',file_name);
//   //    console.log(relative_path);
//     var pdf_path = path.join(__dirname, relative_path);
//   //  console.log ("pdf_path : " + pdf_path);
    
//    console.log ("pdf_path : " + pdf_path);
//     console.log ("file_name : " + file_name.replace(/\.[^/.]+$/, ""));
  

//     convertMod.convertThumsPdf(pdf_path, file_name.replace(/\.[^/.]+$/, ""), function (err, output) {
//      //    console.log(err);
//      //    console.log(output);
//          res.json(output);
//     });


    // ovde ke treba ova da se skokne i da se vika lambdata za splituvanje
    // VIKANJE LAMBDA

     var file_name =  req.params.filename;
    var relative_path = path.join('uploads',file_name);
    // console.log(file_name);
    // console.log(relative_path);
    var pdf_path = path.join(__dirname, relative_path);
    var filenoExt = file_name.replace(/\.[^/.]+$/, "");

    
        var fpath = './uploads/split/' + filenoExt;
        console.log(fpath);
        fs.readdir(fpath, function(error, filelist) {
            if (error) {
                throw error;
            }
            else {
                var lambda = new AWS.Lambda({region: 'us-west-2', apiVersion: '2015-03-31'});

                filelist.forEach(file => { 
                    if(file.startsWith("page"))
                    {
                       //  var locpath = "./uploads/split/"+ filenoExt +"/" + file ;  
                      var args = {
                          bucketName: 'pronovosrubixcube123',
                          folderName: 'split/' + filenoExt + '/',
                          pdffileName: file.replace(/\.[^/.]+$/, "")
                      }

                        var params = {
                            FunctionName: 'arn:aws:lambda:us-west-2:001625110443:function:pdf2Thumb', /* required */
                            Payload:  JSON.stringify(args)
                        };
                        lambda.invoke(params, function(err, data) {
                            if (err) console.log(err, err.stack); // an error occurred
                            else{
                            //  fs.unlinkSync(locpath);
                            console.log(params.Payload);           // successful response
                            }
                        });
                    }
                });

                 res.json(filelist);
            }
        });
});




app.get('/folderlistdata/:foldername', function (req, res, next) {
    var foldername =  req.params.foldername;
    var fpath = './uploads/split/' + foldername;



        fs.readFile( fpath + '/doc_data.txt', function(err, data) {
            if(err) throw err;
            var array = data.toString().split("\n");
            var num = 0; 
            var arrayFinal =  [];
            for(var i in array) {
                if (array[i].startsWith('BookmarkTitle:') )
                {
                    num++;
                arrayFinal.push(array[i].replace('BookmarkTitle:', ''));
                }
            }
             res.contentType('application/json');
            res.send(JSON.stringify(arrayFinal));
        });

});
   

app.get('/folderlist/:foldername', function (req, res, next) {
    var foldername =  req.params.foldername;
    var fpath = './uploads/split/' + foldername;

   

    fs.readdir(fpath, function(error, filelist) {
          if (error) {
            throw error;
          }
          else {
            var files = [];
            
            filelist.forEach(file => {
                
               var hosturl = "http://localhost:3001";
              
                 var pathpfd = url.resolve(hosturl, fpath) + "/" + file;
               
                 var pdfname =  file;
                files.push({pdfPath: pathpfd, pdfName: pdfname});
            });
            res.contentType('application/json');
            res.send(JSON.stringify(files));
          }
        });
});

app.listen('3001', function () {
    console.log('running on 3001...');
});