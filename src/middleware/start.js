//import fs from "fs"
//import helper from "../core/helper"

/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
function invokeStart(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        let st = new Date().getTime();
        
        try {
            if (!jinghuan.HOST || jinghuan.HOST === ctx.hostname) {
                await next();
                await ctx.events.emit('finish');
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

export default invokeStart;
