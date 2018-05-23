/**
 *
 * @param options
 * @param app
 * @return {Function}
 */
function MidCross(options, app) {
    
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
                ctx.slog.stop()
            } else {
                await next();
            }
        } else {
            await next();
        }
    }
}

export default MidCross
