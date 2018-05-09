/**
 *
 * @param options
 * @param app
 * @return {function(*, *)}
 */
function invokeJsonRpc(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        await next();
        //if (jinghuan.app.modules) {
        //    if (jinghuan.app.modules.indexOf(ctx.module) !== -1) {
        //        await next();
        //        return;
        //    }
        //}
        //ctx.status = 403;
    };
};

export default invokeJsonRpc;
