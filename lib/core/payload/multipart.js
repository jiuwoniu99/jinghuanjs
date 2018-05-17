'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _helper = require('../helper');

var _helper2 = _interopRequireDefault(_helper);

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

var _onFinished = require('on-finished');

var _onFinished2 = _interopRequireDefault(_onFinished);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fsUnlink = _helper2.default.promisify(_fs2.default.unlink, _fs2.default);

module.exports = (ctx, opts = {}) => {
    const req = ctx.req;
    const form = new _formidable2.default.IncomingForm(opts);
    if (opts.uploadDir && !_helper2.default.isDirectory(opts.uploadDir)) {
        _helper2.default.mkdir(opts.uploadDir);
    }

    let uploadFiles = null;

    (0, _onFinished2.default)(ctx.res, () => {
        if (!uploadFiles) return;
        Object.keys(uploadFiles).forEach(key => {
            const file = uploadFiles[key];
            if ((0, _isArray2.default)(file)) {
                file.forEach(item => {
                    const filepath = item.path;
                    if (_helper2.default.isExist(filepath)) fsUnlink(filepath);
                });
            } else {
                const filepath = file.path;
                if (_helper2.default.isExist(filepath)) fsUnlink(filepath);
            }
        });
    });

    return new Promise((resolve, reject) => {
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