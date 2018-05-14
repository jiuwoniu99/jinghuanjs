import session from "../core/session";

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
        let Session = new session(ctx);
        try {
            Object.defineProperty(ctx, 'session', {
                get() {
                    return Session.run;
                }
            });
            await next();
        } catch (ex) {
        } finally {
            await ctx.events.emit('finish');
        }
    };
};

export default invokeSession;
