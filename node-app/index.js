
var inspect = require('eyespect').inspector({maxLength:20000});
var path = require('path');
//var should = require('should');
var assert = require('assert');
var fs = require('fs');
var async = require('async');

var convert = require('./lib/convert.js');
var split = require('./lib/split.js');

// https://github.com/nisaacson/pdf-extract
// DA SE SPLITUVA PDF-OT

    var file_name = 'Bellevue Office Tower Archs.pdf';
    var relative_path = path.join('uploads',file_name);
    console.log(__dirname);
    var pdf_path = path.join(__dirname, relative_path);
    console.log (relative_path);
    console.log ("pdf_path : " + pdf_path);
    
    split(pdf_path, function (err, output) {
      // console.log(err);
      // console.log(output);
    });



// DA SE KONVERTIRA OD PDF VO TIF
  // convert('./test/test_data/multipage_searchable.pdf', function (err, tif_path) {
//   convert('./test/test_data/single_page_raw.pdf', function (err, tif_path) {
//         console.log(err);
//          console.log(tif_path);
//  });