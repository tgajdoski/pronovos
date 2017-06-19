var express = require('express');
var request = require('request');

var pdftohtml = require('pdftohtmljs');
var jsdom = require('jsdom');
var jq = require('jquery');

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
var dotenv  = require('dotenv');
var downloader = require('s3-download-stream')

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var url = require('url');

var exec = require('child_process').exec
var HtmlDocx = require('html-docx-js');


 dotenv.load();

var AWS = require("aws-sdk");

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY});



app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

var s3 = require('s3');

// upload to s3 from local ./uploads folder - after file is uploaded to node-app inside uploads
var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY,
     region:  process.env.AWS_REGION
  },
});

mongoose.connect('mongodb://localhost:27017/files', function (err, connect) {
    if (err) 
        console.log("connection err", err);
    else 
        console.log("Connection Successfulll......");
    }
);

/** Serving from the same express Server
    No cors required */
app.use(express.static('../client'));
//app.use(express.static('./uploads/split'));
// app.use("/uploads",express.static('./uploads'));

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

var storageocr = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/ocr/');
    },
    filename: function (req, file, cb) {
        console.log(file);
        file
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.png');
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

/** API path that will upload the files */
app.post('/upload', function (req, res, err) {
            upload(req, res, function (err) {
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
                            Bucket: "pronovosrubixcube",
                            Key: req.file.filename
                        },
                    };
                    var uploader = client.uploadFile(params);
                    // uploader.on('error', function(err) {
                    // console.error("unable to upload:", err.stack);
                    // });
                    uploader.on('progress', function() {
                    console.log("progress", uploader.progressMd5Amount,
                                uploader.progressAmount, uploader.progressTotal);
                    });
                    uploader.on('end', function() {
                    //    fs.unlinkSync(locpath);
                        console.log("done uploading  " + locpath);
                    });

                    // do tuka treba da e iskopiran na S3 veke


                    // ovoj del e za da se snimi vo mongoDB so post kon /files i so parametrite 
                    // Set the headers
                    var headers = {
                        "Access-Control-Allow-Credentials" : "true",
                        "Access-Control-Allow-Origin" : "*",
                        'Content-Type': 'application/json'
                    };

                    // Configure the request
                    var options = {
                        uri: 'http://drawback.rubixcubesolutions.com/files',
                        //  uri: 'http://127.0.0.1:3001/files',
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

var uploadOCR = multer({ //multer settings
    storage: storageocr
}).single('file');

app.post('/PostOCRImage', function (req, res, err) {
            uploadOCR(req, res, function (err) {
                if (err) {
                    res.json({error_code: 1, err_desc: err});
                    return;
                } else {
                    var postedFile = req.file;
                    
                    console.log(req.file.filename.replace(/\.[^/.]+$/, ""));
                    var filenamefinal = req.file.filename.replace(/\.[^/.]+$/, "") + ".png";
                    // ovoj del sakam da kopira nakaj s3  - se pravat params
                    var locpath = "./uploads/ocr/";
                    var params = {
                        localFile: "./uploads/ocr/"+filenamefinal,
                        s3Params: {
                            Bucket: "pronovosrubixcube",
                            Key: filenamefinal
                        },
                    };
                 //   console.log(params);


                    var uploader = client.uploadFile(params);
                    // uploader.on('error', function(err) {
                    // console.error("unable to upload:", err.stack);
                    // });
                    uploader.on('progress', function() {
                    console.log("progress", uploader.progressMd5Amount,
                                uploader.progressAmount, uploader.progressTotal);
                    });
                    uploader.on('end', function() {
                       var lambda = new AWS.Lambda({region: 'us-east-1', apiVersion: '2015-03-31'});
 
                        var args = {
                          bucketName: 'pronovosrubixcube',
                        //   folderName: 'ocr/',
                          imagefileName: filenamefinal
                      }

                        var params = {
                            InvocationType: 'RequestResponse',
                            FunctionName: 'arn:aws:lambda:us-east-1:003549873636:function:tesseractLambda-dev-hello',//'arn:aws:lambda:us-west-2:001625110443:function:tesseractLambda', /* required */
                            Payload:  JSON.stringify(args)
                        };
                        lambda.invoke(params, function(err, data) {
                            if (err) {
                                console.log(err, err.stack); 
                                 res.json(err); 
                            }
                            else{
                          //      console.log(data); 
                          //      console.log(data.Payload); 
                                res.json(data.Payload); 
                            }
                        });

                    });
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
                        Bucket: "pronovosrubixcube",
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
  /* 
   ova e za lokalno da se pravat THUMBS
    var file_name =  req.params.filename;
    var relative_path = path.join('uploads',file_name);
  //    console.log(relative_path);
    var pdf_path = path.join(__dirname, relative_path);
  //  console.log ("pdf_path : " + pdf_path);
    
   console.log ("pdf_path : " + pdf_path);
    console.log ("file_name : " + file_name.replace(/\.[^/.]+$/, ""));
  

    convertMod.convertThumsPdf(pdf_path, file_name.replace(/\.[^/.]+$/, ""), function (err, output) {
     //    console.log(err);
     //    console.log(output);
         res.json(output);
    });


    // ovde ke treba ova da se skokne i da se vika lambdata za splituvanje
    // VIKANJE LAMBDA
*/
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
                var lambda = new AWS.Lambda({region: 'us-east-1', apiVersion: '2015-03-31'});

                filelist.forEach(file => { 
                    if(file.startsWith("page"))
                    {
                       //  var locpath = "./uploads/split/"+ filenoExt +"/" + file ;  
                      var args = {
                          bucketName: 'pronovosrubixcube',
                          folderName: 'split/' + filenoExt + '/',
                          pdffileName: file.replace(/\.[^/.]+$/, "")
                      }

                        var params = {
                            FunctionName: 'arn:aws:lambda:us-east-1:003549873636:function:pdf2Thumb', //arn:aws:lambda:us-west-2:001625110443:function:pdf2Thumb', /* required */
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




app.get('/converToDocx/:filename', function (req, res, next) {
 
     var file_name =  req.params.filename;
      var relative_path = './uploads/' + file_name;
var filenoExt = file_name.replace(/\.[^/.]+$/, "");
    var html_file_name = filenoExt + '.html';
     var output_path = './uploads/' + html_file_name;
    // var relative_path = path.join('./uploads',file_name);
    // var pdf_path = path.join(__dirname, relative_path);
    
    // var output_path = path.join('./uploads',html_file_name);
      var doc_file_name = filenoExt + '.docx';
      var output_docx_path = './uploads/' + doc_file_name;
    
  
  
    var convertpdfhtml= function(relative_path, output_path, filenoExt, callback) {
    // options is an optional parameter
    if (!callback || typeof callback != "function") {
        callback = quality;   // callback must be the second parameter
        quality = undefined;  // no option passed
    }

    fs.exists(relative_path, function (exists) {
        if (!exists) { return callback('error, no file exists at the path you specified: ' + relative_path); }
        // get a temp output path
        var cmd = 'pdf2htmlEX  "' + relative_path + '" "'+ output_path+'"';
        
        var child = exec(cmd, function (err, stderr, stdout) {
        if (err) {
            console.log(relative_path);
            console.log(output_path);
            console.log('ERROR' + err);
            return callback(err);
        }
        return callback(null, output_path);
        });
    });
    }



// // konvertiraj od html vo docx
 convertpdfhtml(relative_path, output_path, filenoExt, function (err, output) {
          console.log(err);
       console.log(output);
    //    console.log(filenoExt);
      
       // da se trgaat delovi od hmlt-OT
        var htmlString = fs.readFileSync(output_path);
       
      const { JSDOM } = jsdom;
      const dom = new JSDOM(htmlString);
      var window = (new JSDOM(htmlString, { runScripts: "outside-only" })).window;
       var $ = require('jquery')(window);
        $('head').empty().append(`<meta charset="utf-8"/>
        <style type="text/css">
        @import url('https://fonts.googleapis.com/css?family=Open+Sans');
        </style>
        <title></title>`);
        
        $( ".loading-indicator" ).remove();
        

          var fileName = output_path; //'./test/test_data/a.html';
          fs.writeFile(fileName, window.document.documentElement.outerHTML,
              function (error){
                if (error) 
                  throw error;
                else
                {
                  // var inputFile = './uploads/'+ filenoExt +'-temp.html'
                  var outputFile = output_docx_path; // './test/test_data/multipage_searchableMM.docx'

                  fs.readFile(fileName, 'utf-8', function(err, html) {
                    if (err) throw err;
                    
                    var docx = HtmlDocx.asBlob(html);
                    fs.writeFile(outputFile, docx, function(err) {
                      if (err) 
                        throw err;
                        else
                          res.send(JSON.stringify(outputFile));
                    });
                  });
                
                }
        });

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
                
               var hosturl = "http://drawback.rubixcubesolutions.com";
               // var hosturl = "http://127.0.0.1:3001";
              
                 var pathpfd = url.resolve(hosturl, fpath) + "/" + file;
               
                 var pdfname =  file;
                files.push({pdfPath: pathpfd, pdfName: pdfname});
            });
            res.contentType('application/json');
            res.send(JSON.stringify(files));
          }
        });
});



// app.get('/s3folderlistdata/:foldername', function (req, res, next) {
   
//     var foldername =  req.params.foldername;
//     var fpath = './uploads/split/' + foldername;

//         fs.readFile( fpath + '/doc_data.txt', function(err, data) {
//             if(err) throw err;
//             var array = data.toString().split("\n");
//             var num = 0; 
//             var arrayFinal =  [];
//             for(var i in array) {
//                 if (array[i].startsWith('BookmarkTitle:') )
//                 {
//                     num++;
//                 arrayFinal.push(array[i].replace('BookmarkTitle:', ''));
//                 }
//             }
//              res.contentType('application/json');
//             res.send(JSON.stringify(arrayFinal));
//         });

// });
   

app.get('/s3folderlist/:foldername', function (req, res, next) {
            var foldername =  req.params.foldername;
            var fpath = 'split/' + foldername + '/';
            var b = 'pronovosrubixcube';
            var stagingparams = {
                s3Params: {
                Bucket: 'pronovosrubixcube',
                Prefix: fpath
                }
            };

            var listobj = client.listObjects(stagingparams);
            var dataLst = [];
            listobj.on('data', function(data) {
                dataLst = dataLst.concat(data.Contents);
            });
            listobj.on('error', function(error) {
                console.log(error);
            });
            listobj.on('end', function() {
                if (listobj.progressAmount === 1) {
                     var files = [];
                 //   console.log(JSON.stringify(dataLst));
                    dataLst.forEach(obj => {
                        console.log(obj);
                          var hosturl = "http://drawback.rubixcubesolutions.com/thumb/";
                       //  var hosturl = "http://127.0.0.1:3001/thumb/";
                         var pathpfd = url.resolve(hosturl, foldername) + "/" + obj.Key.split('/').pop();
                         var pdfname =  obj.Key;
                         files.push({pdfPath: pathpfd, pdfName: pdfname});
                    });
                // kolku se: console.log("objects Found " + JSON.stringify(listobj.objectsFound));
                    res.contentType('application/json'); 
                    res.send(JSON.stringify(files));
                }
            })

});


// vrakaj mi bilo kakov file vo stream direktno na client
app.get('/thumb/:foldername/:filename', function (req, res) {

    var folderName = req.params.foldername;
    var filename = req.params.filename

    var file = 'split/'+folderName+'/' + filename;
    var config = {
        client: new AWS.S3(),
        concurrency: 6,
        params: {
            Key: file,
            Bucket: 'pronovosrubixcube'
        }
    }
    downloader(config)
    .pipe(res);
});


app.listen('3001', function () {
    console.log('running on 3001...');
});