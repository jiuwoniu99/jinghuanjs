import isArray from 'lodash/isArray'

/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
function MidStart(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        let st = new Date().getTime();
        try {
            if (isArray(jinghuan.HOST) || jinghuan.HOST.indexOf(ctx.hostname) !== -1) {
                await next();
            } else {
                ctx.status = 404;
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

export default MidStart;
