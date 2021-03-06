//import JSON from 'json5';
import isArray from 'lodash/isArray'
import prettyBytes from 'pretty-bytes';
/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
function SocketStart(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        let st = new Date().getTime();
        try {
            if (isArray(jinghuan.HOST) || jinghuan.HOST.indexOf(ctx.hostname) !== -1) {
                await next();
            }
        } catch (ex) {
            ctx.status = 500;
            ctx.slog.error(ex);
        } finally {
            let et = new Date().getTime();
            ctx.slog.send(et - st);
        }
    };
};

export default SocketStart;
