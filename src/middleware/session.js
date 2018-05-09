//import fs from "fs"
//import helper from "../core/helper"

/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
function invokeSession(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        try {
            await next();
        } catch (ex) {
        } finally {
            await ctx.events.emit('finish');
        }
    };
};

export default invokeSession;
