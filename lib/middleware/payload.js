'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _index = require('../core/payload/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function invokePayload(opts = {}) {
    const extendTypes = Object.assign({
        json: [],
        form: [],
        text: [],
        multipart: [],
        xml: []
    }, opts.extendTypes);

    const jsonTypes = ['application/json', ...extendTypes.json];

    const formTypes = ['application/x-www-form-urlencoded', ...extendTypes.form];

    const textTypes = ['text/plain', ...extendTypes.text];

    const multipartTypes = ['multipart/form-data', ...extendTypes.multipart];

    const xmlTypes = ['text/xml', ...extendTypes.xml];

    return function (ctx, next) {
        if (ctx.request.body !== undefined) return next();

        return parseBody(ctx, {
            opts: {
                limit: opts.limit,
                encoding: opts.encoding
            },
            multipartOpts: {
                keepExtensions: opts.keepExtensions,
                uploadDir: opts.uploadDir,
                encoding: opts.encoding,
                hash: opts.hash,
                multiples: opts.multiples
            }
        }).then(body => {
            ctx.request.body = body;
            return next();
        });
    };

    function parseBody(ctx, opts) {
        const methods = ['POST', 'PUT', 'DELETE', 'PATCH', 'LINK', 'UNLINK'];

        if (methods.every(method => ctx.method !== method)) {
            return Promise.resolve({});
        }

        if (ctx.request.is(textTypes)) {
            return _index2.default.text(ctx, opts.opts);
        }
        if (ctx.request.is(jsonTypes)) {
            return _index2.default.json(ctx, opts.opts);
        }
        if (ctx.request.is(formTypes)) {
            return _index2.default.form(ctx, opts.opts);
        }
        if (ctx.request.is(multipartTypes)) {
            return _index2.default.multipart(ctx, opts.multipartOpts);
        }
        if (ctx.request.is(xmlTypes)) {
            return _index2.default.xml(ctx, opts.opts);
        }

        return Promise.resolve({});
    }
};

exports.default = invokePayload;