const fs = require('fs');
const helper = require('think-helper');

/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
module.exports = (options, app) => {
    /**
     *
     */
    return async(ctx, next) => {
        let st = new Date().getTime();
        try {
            await next();
            let et = new Date().getTime();
            ctx.slog.send(et - st);
        } catch (ex) {
            let et = new Date().getTime();
            ctx.status = 500;
            ctx.slog.error(ex);
            ctx.slog.send(et - st);
        }
    };
};
