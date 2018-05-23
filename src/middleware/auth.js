/**
 *
 * @param options
 * @param app
 * @return {function(*, *)}
 */
function MidAuth(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        if (jinghuan.modules) {
            if (jinghuan.modules.indexOf(ctx.module) !== -1) {
                await next();
                return;
            }
        }
        ctx.status = 403;
    };
};

export default MidAuth;
