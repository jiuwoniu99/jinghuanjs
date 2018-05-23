'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const parse = _safeRequire('../core/payload/index.js');

const parse_str = _safeRequire('locutus/php/strings/parse_str');

function MidPayload(opts = {}) {
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

    const xmlTypes = ['text/xml', 'application/xml', ...extendTypes.xml];

    return function (ctx, next) {
        if (ctx.request.body !== undefined) return next();

        let param = {};
        parse_str(ctx.querystring, param);
        ctx.request._query = param;

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
            return parse.text(ctx, opts.opts);
        }
        if (ctx.request.is(jsonTypes)) {
            return parse.json(ctx, opts.opts);
        }
        if (ctx.request.is(formTypes)) {
            return parse.form(ctx, opts.opts);
        }
        if (ctx.request.is(multipartTypes)) {
            return parse.multipart(ctx, opts.multipartOpts);
        }
        if (ctx.request.is(xmlTypes)) {
            return parse.xml(ctx, opts.opts);
        }

        return Promise.resolve({});
    }
};

exports.default = MidPayload;

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