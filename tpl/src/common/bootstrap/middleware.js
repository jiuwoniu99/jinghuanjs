import path from "path"

module.exports = [
    {
        // gzip
        handle: 'compress',
        options: {}
    },
    {
        // 启动
        handle: 'start',
        options: {}
    },
    {
        // 内存监控
        handle: 'm',
        options: {}
    },
    {
        // json-rpc 2.0
        handle: 'rpc',
        options: {}
    },
    {
        // jinghuan-api
        handle: 'api',
        options: {
            debug: true
        }
    },
    {
        // 静态资源
        handle: 'resource',
        options: {
            root: path.join(jinghuan.ROOT_PATH, 'www'),
            publicPath: /^\/(static|favicon\.ico)/
        }
    },
    {
        // 请求数据解析
        handle: 'payload',
        options: {}
    },
    {
        handle: 'router',
        options: {}
    },
    {
        // 路由
        handle: 'cross',
        options: {}
    },
    {
        // session
        handle: 'session',
        options: {}
    },
    {
        // controller
        handle: 'controller',
        options: {}
    },
];
