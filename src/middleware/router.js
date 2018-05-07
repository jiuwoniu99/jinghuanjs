//import pathToRegexp from "path-to-regexp"

/**
 *
 * @param options
 * @param app
 * @return {Function}
 */
function invokeRouter(options, app) {
    /**
     *
     */
    return async function (ctx, next) {
        
        let pathname = ctx.path || '';
        pathname = pathname.trim().replace(/\/+/ig, '/');
        pathname = pathname.replace(/(^\/*)|(\/*$)/g, '');
        pathname = pathname.split('/');
        let [module, controller, action] = pathname;
        //let module = pathname.shift();
        //let action = pathname.shift();
        //let controller = pathname.shift();
        ctx.module = module || 'index';
        ctx.controller = controller || 'index';
        ctx.action = action || 'index';
        
        await next();
    };
};

export default invokeRouter;
