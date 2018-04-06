const defaultOption = {
    module: 'home',
    controller: 'index',
    action: 'index'
}

module.exports = function (options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        let {origin} = ctx.header;
        let AccessControlRequestHeaders = ctx.header['access-control-request-headers'];
        let AccessControlRequestMethod = ctx.header['access-control-request-method'];
        //console.log(ctx.header)
        if (origin) {
            
            let headers = {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
            };
            
            if (AccessControlRequestHeaders) {
                headers['Access-Control-Allow-Headers'] = AccessControlRequestHeaders;
                
            }
            if (AccessControlRequestMethod) {
                headers['Access-Control-Allow-Method'] = AccessControlRequestMethod;
            }
            
            ctx.set(headers);
            
            if (ctx.isMethod('options')) {
                ctx.body = '';
            } else {
                await next();
            }
        } else {
            await next();
        }
    }
}
