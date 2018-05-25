import session from "../core/session";

//import onFinished from "on-finished";

/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
function MidSession(options, app) {
    
    
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
            console.error(ex);
            return ctx.throw(500);
        } finally {
            await Session.finish();//ctx.events.emit('finish');
        }
    };
};

export default MidSession;
