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
    };
};

export default invokeJsonRpc;
