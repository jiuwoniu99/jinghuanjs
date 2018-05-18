import parse from "../core/payload/index.js"
import parse_str from 'locutus/php/strings/parse_str';

function invokePayload(opts = {}) {
    const extendTypes = Object.assign({
        json: [],
        form: [],
        text: [],
        multipart: [],
        xml: []
    }, opts.extendTypes);
    
    // default json types
    const jsonTypes = [
        'application/json',
        ...extendTypes.json
    ];
    
    // default form types
    const formTypes = [
        'application/x-www-form-urlencoded',
        ...extendTypes.form
    ];
    
    // default text types
    const textTypes = [
        'text/plain',
        ...extendTypes.text
    ];
    
    // default multipart-form types
    const multipartTypes = [
        'multipart/form-data',
        ...extendTypes.multipart
    ];
    
    // default xml types
    const xmlTypes = [
        'text/xml',
        'application/xml',
        ...extendTypes.xml
    ];
    
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

export default invokePayload;
