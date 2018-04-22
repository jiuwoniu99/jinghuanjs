'use strict';

var fs = require('fs');
var helper = require('../helper');
var formidable = require('formidable');
var onFinish = require('on-finished');

var fsUnlink = helper.promisify(fs.unlink, fs);

module.exports = function (ctx) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var req = ctx.req;
  var form = new formidable.IncomingForm(opts);
  if (opts.uploadDir && !helper.isDirectory(opts.uploadDir)) {
    helper.mkdir(opts.uploadDir);
  }

  var uploadFiles = null;

  onFinish(ctx.res, function () {
    if (!uploadFiles) return;
    Object.keys(uploadFiles).forEach(function (key) {
      var file = uploadFiles[key];
      if (helper.isArray(file)) {
        file.forEach(function (item) {
          var filepath = item.path;
          if (helper.isExist(filepath)) fsUnlink(filepath);
        });
      } else {
        var filepath = file.path;
        if (helper.isExist(filepath)) fsUnlink(filepath);
      }
    });
  });

  return new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) return reject(err);

      uploadFiles = files;
      resolve({
        post: fields,
        file: files
      });
    });
  });
};