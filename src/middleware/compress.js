import compress from 'koa-compress';
import interopRequire from '../core/helper/interopRequire'

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
        flush: interopRequire('zlib').Z_SYNC_FLUSH
    })
}

export default invokeCompress;
