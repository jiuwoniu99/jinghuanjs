import raw from 'raw-body';
import inflate from 'inflation';
import parse_str from 'locutus/php/strings/parse_str';

/**
 *
 * @param ctx
 * @param opts
 * @return {Promise<{post: obj}>}
 */
export default function (ctx, opts = {}) {
    const req = ctx.req;
    
    // defaults
    const len = req.headers['content-length'];
    const encoding = req.headers['content-encoding'] || 'identity';
    if (len && encoding === 'identity') opts.length = ~~len;
    opts.encoding = opts.encoding || 'utf8';
    opts.limit = opts.limit || '1mb';
    
    return raw(inflate(req), opts)
        .then((str) => {
            let data = {}
            parse_str(str, data)
            return data;
        })
        .then(data => ({post: data}));
};
