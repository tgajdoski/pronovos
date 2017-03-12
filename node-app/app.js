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

var convert = require('./lib/convert.js');
var split = require('./lib/split.js');


var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var url = require('url');




mongoose.connect('mongodb://localhost:27017/files', function (err, connect) {
    if (err) 
        console.log("connection err", err);
    else 
        console.log("Connection Successfulll......");
    }
);

app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
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
           // console.log("se povikuva so json:  " + myJSONObject);

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
        console.log(result);
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
//    console.log(relative_path);
    var pdf_path = path.join(__dirname, relative_path);
  //  console.log ("pdf_path : " + pdf_path);
    
    split(pdf_path, file_name.replace(/\.[^/.]+$/, ""), function (err, output) {
       //  console.log(err);
         console.log(output);
         res.json(output);
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
                console.log(file);
             //   var pathpfd = path.parse(fpath + "/"  + file);
               
               var hosturl = "http://localhost:3001";
                console.log(" hosturl" + hosturl);
                 console.log(" fpath" + fpath);
                  console.log("file " + file);
                 var pathpfd = url.resolve(hosturl, fpath , file);
                 console.log(pathpfd);
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