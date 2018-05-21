'use strict';

const fs = _safeRequire('fs');

const helper = _safeRequire('../helper');

const formidable = _safeRequire('formidable');

const onFinish = _safeRequire('on-finished');

const isArray = _safeRequire('lodash/isArray');

const fsUnlink = helper.promisify(fs.unlink, fs);

module.exports = (ctx, opts = {}) => {
    const req = ctx.req;
    const form = new formidable.IncomingForm(opts);
    if (opts.uploadDir && !helper.isDirectory(opts.uploadDir)) {
        helper.mkdir(opts.uploadDir);
    }

    let uploadFiles = null;

    onFinish(ctx.res, () => {
        if (!uploadFiles) return;
        Object.keys(uploadFiles).forEach(key => {
            const file = uploadFiles[key];
            if (isArray(file)) {
                file.forEach(item => {
                    const filepath = item.path;
                    if (helper.isExist(filepath)) fsUnlink(filepath);
                });
            } else {
                const filepath = file.path;
                if (helper.isExist(filepath)) fsUnlink(filepath);
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

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}