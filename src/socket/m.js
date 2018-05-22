import prettyBytes from "pretty-bytes";

/**
 *
 * @param options
 * @param app
 * @return {function(*, *)}
 */
function socketM(options, app) {
    /**
     *
     */
    return async (ctx, next) => {
        await next();
        let {
            rss,
            heapTotal,
            heapUsed,
            external
        } = process.memoryUsage();
        
        //ctx.slog.info(`进程常驻内存:${prettyBytes(rss)} ; 已申请的堆内存:${prettyBytes(heapTotal)} ; 已使用的内存:${prettyBytes(heapUsed)}`);
        //ctx.websocket.send(`进程常驻内存:${prettyBytes(rss)} ; 已申请的堆内存:${prettyBytes(heapTotal)} ; 已使用的内存:${prettyBytes(heapUsed)}`)
    };
};

export default socketM;
