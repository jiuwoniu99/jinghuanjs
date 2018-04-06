'use strict';

var http = require('http');
var querystring = require('querystring');
var Readable = require('stream').Readable;
//const _ = require('lodash');
//
var helper = require('../helper');
//
var IncomingMessage = http.IncomingMessage;
var ServerResponse = http.ServerResponse;
/**
 * default args
 */
var defaultArgs = {
    method: 'GET',
    httpVersion: '1.1'
};

/**
 *
 * @param reqArgs
 * @param app
 * @return {{req: *, res: *}}
 */
module.exports = function (reqArgs, app) {
    if (helper.isString(reqArgs)) {
        if (reqArgs[0] === '{') {
            reqArgs = JSON.parse(reqArgs);
        } else if (/^\w+=/.test(reqArgs)) {
            reqArgs = querystring.parse(reqArgs);
        } else {
            reqArgs = { url: reqArgs };
        }
    }
    var req = null;
    // has request in reqArgs
    if (reqArgs.req) {
        req = Object.assign({}, reqArgs.req);
        delete reqArgs.req;
    } else {
        req = new IncomingMessage(new Readable());
    }
    var res = null;
    if (reqArgs.res) {
        res = reqArgs.res;
        delete reqArgs.res;
    } else {
        res = new ServerResponse(req);
    }

    // rewrite end method, exit process when invoke end method
    if (reqArgs.exitOnEnd) {
        delete reqArgs.exitOnEnd;
        res.end = function (msg) {
            process.exit();
        };
    }

    var args = Object.assign({}, defaultArgs, reqArgs);
    for (var name in args) {
        req[name] = args[name];
    }

    if (!app) return { req: req, res: res };
    var fn = app.callback();
    return fn(req, res);
};