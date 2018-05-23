'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app, wsOptions, httpsOptions) {
    const oldListen = app.listen;
    app.listen = function () {
        debug('Attaching server...');
        if (typeof httpsOptions === 'object') {
            const httpsServer = https.createServer(httpsOptions, app.callback());
            app.server = httpsServer.listen.apply(httpsServer, arguments);
        } else {
            app.server = oldListen.apply(app, arguments);
        }
        const options = { server: app.server };
        if (wsOptions) {
            for (var key in wsOptions) {
                if (wsOptions.hasOwnProperty(key)) {
                    options[key] = wsOptions[key];
                }
            }
        }
        app.ws.listen(options);
        return app.server;
    };
    app.ws = new Socket(app);
    return app;
};

const response = _safeRequire('./res');

const url = _safeRequire('url');

const https = _safeRequire('https');

const compose = _safeRequire('koa-compose');

const co = _safeRequire('co');

const ws = _safeRequire('ws');

const JSON = _safeRequire('json5');

const WebSocketServer = ws.Server;
const debug = _safeRequire('debug')('JH:core/socket');

let Socket = class Socket {
    constructor(app) {
        this.app = app;
        this.middleware = [];
    }

    listen(options) {
        this.server = new WebSocketServer(options);
        this.server.on('connection', (socket, req) => {
            this.onConnection(socket, req);
        });
    }

    onMessage(message, socket, req) {}

    onConnection(socket, req) {
        debug('Connection received');

        socket.on('error', function (err) {
            debug('Error occurred:', err);
        });

        socket.on('message', message => {
            let res = new response();
            let context = this.app.createContext(req, res);

            context.websocket = socket;
            context.path = url.parse(req.url).pathname;
            context.status = 200;
            context.originalMethod = context.method;
            context.method = 'MESSAGE';
            context.message = message;

            this.wrap(context);
        });

        let res = new response();
        let context = this.app.createContext(req, res);

        context.websocket = socket;
        context.path = url.parse(req.url).pathname;
        context.status = 200;
        context.originalMethod = context.method;
        context.method = 'CONNECTION';

        this.wrap(context);
    }
    wrap(context) {
        const fn = co.wrap(compose(this.middleware));
        fn(context).then(() => {
            if (context.body) {
                context.websocket.send(JSON.stringify(context.body));
            }
        }).catch(function (err) {
            debug(err);
        });
    }

    use(fn) {
        this.middleware.push(fn);
        return this;
    }
};
;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}