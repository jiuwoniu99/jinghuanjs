import session from "../core/session";
import onFinished from "on-finished";

/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
function SocketSession(options, app) {
    
    
    /**
     *
     */
    return async (ctx, next) => {
        if (ctx.websocket && !ctx.websocket.session) {
            ctx.websocket.session = new session(ctx);
        }
        try {
            Object.defineProperty(ctx, 'session', {
                get() {
                    return ctx.websocket.session.run;
                }
            });
            await next();
        } catch (ex) {
        } finally {
            //await Session.finish();
        }
    };
};

export default SocketSession;
