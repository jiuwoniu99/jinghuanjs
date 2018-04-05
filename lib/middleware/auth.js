const defaultOption = {
    module: 'home',
    controller: 'index',
    action: 'index'
};

/**
 *
 * @param options
 * @param app
 * @return {function(*, *)}
 */
module.exports = function(options, app) {
    /**
     *
     */
    return async(ctx, next) => {
        if (jinghuan.modules) {
            if (jinghuan.modules.indexOf(ctx.module) !== -1) {
                await next();
                return;
            }
        }
        ctx.status = 403;
    };
};
