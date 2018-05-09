import compress from 'koa-compress';

/**
 *
 * @param options
 * @param app
 * @return {Function}
 */
function invokeCompress(options, app) {
    /**
     *
     */
    return compress({
        threshold: 1,
        flush: require('zlib').Z_SYNC_FLUSH
    })
}

export default invokeCompress;
