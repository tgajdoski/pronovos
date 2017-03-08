var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/files', function (err, connect) {
  if (err) console.log("connection err", err)
  else console.log("Connection Successfulll......")
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

router.get('/files', function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  fileModel.find({}, function (err, result) {
    res.json(result);
  });
});

router.get('/files/:start/:limit', function (req, res, next) {
  var start = req.params.start;
  var limit = req.params.limit;

  console.log("Start : ", start, "Type of Start : ", typeof start)
  // res.header("Access-Control-Allow-Origin", "*");
  fileModel.count({}, function (err, totalCount) {
    fileModel.find({}, function (err, result) {
      var endResult = {
        totalCount: totalCount,
        data: result
      }
      res.json(endResult);
    }).skip(parseInt(start)).limit(parseInt(limit));
  });

});

router.get('/files/:fileId', function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  fileId = req.params.fileId;
  fileModel.findOne({
    '_id': fileId
  }, function (err, result) {
    res.json(result);
  });
});


router.post('/files', function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  var singleFile = new fileModel();

  var jsonData = JSON.parse(req.body.data);

  singleFile.fieldname = jsonData.fieldname;
  singleFile.originalname = jsonData.originalname;
  singleFile.encoding = jsonData.encoding;
  singleFile.mimetype = jsonData.mimetype;
  singleFile.destination = jsonData.destination;
  singleFile.filename = jsonData.filename;
  singleFile.path = jsonData.path;
  singleFile.size =jsonData.size;
  singleFile.uploadDate = new Date();

  singleFile.save(function (err, result) {
    res.json(result);
  });
});

router.put('/files/:fileId', function (req, res, next) {
  // res.header('Access-Control-Allow-Origin: *');
  // res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
  // res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
  // if ('OPTIONS' == req.method) {
  //   res.send(200);
  // }

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
    singleFile.size =jsonData.size;
    singleFile.uploadDate = new Date();

    singleFile.save(function (err, result) {
      res.json(result);
    });
  });
});

router.put('/files', function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  var jsonData = JSON.parse(req.body.data);
  fileId = jsonData.fileId
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
    singleFile.size =jsonData.size;
    singleFile.uploadDate = new Date();
    
    singleFile.save(function (err, result) {
      res.json(result);
    });
  });
});

router.delete('/files/:fileId', function (req, res, next) {
  // res.header('Access-Control-Allow-Origin: *');
  // res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
  // res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    fileId = req.params.employeeId;
    fileModel.remove({
      '_id': fileId
    }, function (err, result) {
      res.json(result);
    });
  }

});

module.exports = router;