/**
 *
 * @param options
 * @param app
 * @return {function(*, *)}
 */
function invokeAuth(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        if (jinghuan.app.modules) {
            if (jinghuan.app.modules.indexOf(ctx.module) !== -1) {
                await next();
                return;
            }
        }
        ctx.status = 403;
    };
};

export default invokeAuth;
