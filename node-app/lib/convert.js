/**
 * Converts a pdf file at a given path to a tiff file with
 * the GraphicsMagick command "convert"
 */
var temp = require('temp');
var path = require('path');
var exec = require('child_process').exec
var spawn = require('child_process').spawn;
var fs = require('fs');
var pdf_convert_quality = 400; // default to density 400 for the convert command


/**
 * @param input_path the path to a pdf file on disk. Since GhostScript requires random file access, we need a path
 *   to an actual file rather than accepting a stream
 * @param {String} quality is an optional flag that controls the quality of the pdf to tiff conversion.
 * @return {String} output_path the path to the converted tif file
 * @return callback(<maybe error>, output_path)
 */

exports = module.exports = {

 convertHugeTiff: function(input_path, quality, callback) {
  // options is an optional parameter
  if (!callback || typeof callback != "function") {
    callback = quality;   // callback must be the second parameter
    quality = undefined;  // no option passed
  }

  fs.exists(input_path, function (exists) {
    if (!exists) { return callback('error, no file exists at the path you specified: ' + input_path); }
    // get a temp output path

    var output_path = temp.path({prefix: 'tif_output', suffix:'.tif'});
    // var output_path = path.join(__dirname,'test/test_data/single_page_raw.tif');
    var params = [
      // '-depth 8',
      // '-background white',
      // '-flatten +matte',
      // '-density '+pdf_convert_quality,
      input_path,
      output_path
    ];
    if (quality) {
      if (typeof(quality) !== 'string' && typeof(quality) !== 'number') {
        return callback('error, pdf quality option must be a string, you passed a ' + typeof(quality));
      }
      pdf_convert_quality = quality;
    }
    var cmd = 'gs -sDEVICE=tiffgray -r720x720 -g6120x7920 -sCompression=lzw -o "' + output_path + '" "'+input_path+'"';
    // var cmd = 'convert -depth 8 -background white -flatten +matte -density '+pdf_convert_quality+' "'+ input_path +'"  "' + output_path+'"';
    var child = exec(cmd, function (err, stderr, stdout) {
      if (err) {
        return callback(err);
      }
      return callback(null, output_path);
    });
  });
},




convertThumsPdf: function(input_path, filenamefordir, callback ) {
  if (!callback || typeof callback != "function") {
    callback = filenamefordir;   // callback must be the second parameter
    filenamefordir = undefined;  // no option passed
  }

  
  // options is an optional parameter
   var otp_path = '/../uploads/split/'; // linundefined
    var output_dir = path.join(__dirname +  otp_path + filenamefordir ); //temp.path({},'pdf_pages');
  


    var output_name = 'file%05d.png"';
     var output_path = path.join(output_dir, output_name);

      console.log("o : "  + output_path);
      console.log("i : "  + input_path);

  fs.exists(input_path, function (exists) {
    if (!exists) { return callback('error, no file exists at the path you specified: ' + input_path); }
    // get a temp output path

  // ova e za golemite   
   // var cmd = 'gs -sDEVICE=tiffgray -r720x720 -g6120x7920 -sCompression=lzw -o "' + output_path + '" "'+input_path+'"';
    // ova e ok 
    // var cmd = 'gs -dDownScaleFactor=8 -o file-%03d.png -sDEVICE=pnggray -dTextAlphaBits=4  "' + input_path + '"';

      var cmd = 'gs -dDownScaleFactor=8 -o "' + output_path + '  -sDEVICE=pnggray -dTextAlphaBits=4  "' + input_path + '"';
 
    var child = exec(cmd, function (err, stderr, stdout) {
      if (err) {
          var output_err = {
            message: 'an error occurred while converting pdf into single png with the gs  command',
            error: err
          }
          console.log(err);
          callback(output_err, null);
          return;
      }
       return callback(null, output_path);
      // return get_pdfs_in_directory(output_dir, callback);    
    });



  });
},


}