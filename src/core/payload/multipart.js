import fs from 'fs';
import helper from '../helper';
import formidable from 'formidable';
import onFinish from 'on-finished'
import isArray from 'lodash/isArray';

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
                    if (helper.isExist(filepath))
                        fsUnlink(filepath);
                });
            } else {
                const filepath = file.path;
                if (helper.isExist(filepath))
                    fsUnlink(filepath);
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
