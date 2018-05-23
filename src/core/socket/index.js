'use strict';
import response from './res';
import url from 'url';
import https from 'https';
import compose from 'koa-compose';
import co from 'co';
import ws from 'ws';
import JSON from 'json5'

const WebSocketServer = ws.Server;
const debug = require('debug')('JH:core/socket');

/**
 *
 */
class Socket {
    
    /**
     *
     * @param app
     */
    constructor(app) {
        this.app = app;
        this.middleware = [];
    }
    
    /**
     *
     * @param options
     */
    listen(options) {
        this.server = new WebSocketServer(options);
        this.server.on('connection', (socket, req) => {
            this.onConnection(socket, req)
        });
        //this.app.server.on('upgrade', function upgrade(request, socket, head) {
        //    console.log()
        //    //const pathname = url.parse(request.url).pathname;
        //    //
        //    //if (pathname === '/foo') {
        //    //    wss1.handleUpgrade(request, socket, head, function done(ws) {
        //    //        wss1.emit('connection', ws, request);
        //    //    });
        //    //} else if (pathname === '/bar') {
        //    //    wss2.handleUpgrade(request, socket, head, function done(ws) {
        //    //        wss2.emit('connection', ws, request);
        //    //    });
        //    //} else {
        //    //    socket.destroy();
        //    //}
        //});
    };
    
    /**
     *
     * @param socket
     * @param req
     * @param method
     * @param message
     */
    onMessage(socket, req, method, message) {
        let res = new response();
        let context = this.app.createContext(req, res);
        
        context.websocket = socket;
        context.path = url.parse(req.url).pathname;
        context.status = 200;
        context.originalMethod = context.method;
        context.method = method;
        context.message = message;
        
        this.wrap(context);
    }
    
    /**
     *
     * @param socket
     * @param req
     */
    onConnection(socket, req) {
        debug('Connection received');
        
        socket.on('error', function (err) {
            debug('Error occurred:', err);
            this.onMessage(socket, req, 'ERROR', '')
        });
        
        socket.on('message', (message) => {
            this.onMessage(socket, req, 'MESSAGE', message)
        });
        
        socket.on('close', () => {
            this.onMessage(socket, req, 'CLOSE', '')
        })
        
        this.onMessage(socket, req, 'CONNECTION', '')
    };
    
    /**
     *
     * @param context
     */
    wrap(context) {
        const fn = co.wrap(compose(this.middleware));
        fn(context)
            .then(() => {
                if (context.body) {
                    context.websocket.send(JSON.stringify(context.body))
                }
            })
            .catch(function (err) {
                debug(err);
            });
    }
    
    /**
     *
     * @param fn
     * @return {Socket}
     */
    use(fn) {
        this.middleware.push(fn);
        return this;
    };
}

/**
 *
 * @param app
 * @param wsOptions
 * @param httpsOptions
 * @return {*}
 */
export default function (app, wsOptions, httpsOptions) {
    const oldListen = app.listen;
    app.listen = function () {
        debug('Attaching server...');
        if (typeof httpsOptions === 'object') {
            const httpsServer = https.createServer(httpsOptions, app.callback());
            app.server = httpsServer.listen.apply(httpsServer, arguments);
        } else {
            app.server = oldListen.apply(app, arguments);
        }
        const options = {server: app.server};
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
