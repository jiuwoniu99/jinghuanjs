import JSON from 'json5';
import raw from 'raw-body';
import inflate from 'inflation';

/**
 *
 * @param ctx
 * @param opts
 * @return {Promise<{post: T}>}
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
        .then(str => {
            try {
                return JSON.parse(str)
            } catch (ex) {
                return {};
            }
        })
        .then(data => ({post: data}));
};
