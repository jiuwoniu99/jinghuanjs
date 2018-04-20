const debug = require('debug')('JH:extend/controller');
const assert = require('assert');
//const _ = require('lodash');
/**
 * extend controller
 */
module.exports = {
    
    /**
     *
     */
    get body() {
        return this.ctx.body;
    },
    
    /**
     *
     * @param value
     */
    set body(value) {
        this.ctx.body = value;
    },
    
    /**
     *
     */
    get ip() {
        return this.ctx.ip;
    },
    
    /**
     *
     * @return {*|Array|string|string[]}
     */
    get ips() {
        return this.ctx.ips;
    },
    
    /**
     *
     */
    get status() {
        return this.ctx.status;
    },
    
    /**
     *
     * @param status
     */
    set status(status) {
        this.ctx.status = status;
    },
    
    /**
     *
     */
    get type() {
        return this.ctx.type;
    },
    
    /**
     *
     * @param contentType
     */
    set type(contentType) {
        this.ctx.type = contentType;
    },
    
    /**
     *
     */
    get userAgent() {
        return this.ctx.userAgent;
    },
    
    /**
     *
     */
    get method() {
        return this.ctx.method;
    },
    
    /**
     *
     * @return {*|boolean}
     */
    get isGet() {
        return this.ctx.isGet;
    },
    
    /**
     *
     * @return {*|boolean}
     */
    get isPost() {
        return this.ctx.isPost;
    },
    
    /**
     *
     * @return {*|boolean}
     */
    get isCli() {
        return this.ctx.isCli;
    },
    
    /**
     *
     * @param name
     * @param value
     * @param m
     * @return {*}
     */
    config(name, value, m = this.ctx.module) {
        return jinghuan.config(name, value, m);
    },
    
    /**
     *
     * @param method
     * @return {*|boolean}
     */
    isMethod(method) {
        return this.ctx.isMethod(method);
    },
    
    /**
     *
     * @param method
     * @return {*|boolean}
     */
    isAjax(method) {
        return this.ctx.isAjax(method);
    },
    
    /**
     *
     * @param callbackField
     * @return {*|boolean}
     */
    isJsonp(callbackField) {
        return this.ctx.isJsonp(callbackField);
    },
    
    /**
     *
     * @param data
     * @param callbackField
     */
    jsonp(data, callbackField) {
        return this.ctx.jsonp(data, callbackField);
    },
    
    /**
     *
     * @param data
     */
    json(data) {
        return this.ctx.json(data);
    },
    
    /**
     *
     * @param data
     * @param message
     */
    success(data, message) {
        return this.ctx.success(data, message);
    },
    
    /**
     *
     * @param errno
     * @param errmsg
     * @param data
     */
    fail(errno, errmsg, data) {
        return this.ctx.fail(errno, errmsg, data);
    },
    
    /**
     *
     * @param time
     */
    expires(time) {
        return this.ctx.expires(time);
    },
    
    /**
     *
     * @param name
     * @param value
     */
    get(name, value) {
        return this.ctx.param(name, value);
    },
    
    /**
     *
     * @param name
     * @param value
     */
    query(name, value) {
        return this.ctx.param(name, value);
    },
    
    /**
     *
     * @param name
     * @param value
     */
    post(name, value) {
        return this.ctx.post(name, value);
    },
    
    /**
     *
     * @param name
     * @param value
     */
    file(name, value) {
        return this.ctx.file(name, value);
    },
    
    /**
     *
     * @param name
     * @param value
     * @param options
     */
    cookie(name, value, options) {
        return this.ctx.cookie(name, value, options);
    },
    
    /**
     *
     * @param name
     * @param value
     */
    header(name, value) {
        if (value === undefined && helper.isString(name)) {
            return this.ctx.header[name];
        }
        if (this.ctx.res.headersSent) {
            debug(`headers has already sent, url: ${this.ctx.url}`);
            return;
        }
        if (value !== undefined) {
            return this.ctx.set(name, value);
        }
        if (helper.isObject(name)) {
            return this.ctx.set(name);
        }
    },
    
    /**
     *
     * @param onlyHost
     */
    referrer(onlyHost) {
        return this.ctx.referer(onlyHost);
    },
    
    /**
     *
     * @param onlyHost
     */
    referer(onlyHost) {
        return this.ctx.referer(onlyHost);
    },
    
    /**
     *
     * @param url
     * @param alt
     * @return {boolean}
     */
    redirect(url, alt) {
        this.ctx.redirect(url, alt);
        return false;
    },
    
    /**
     *
     * @param name
     * @param m
     */
    controller(name, m = this.ctx.module) {
        let mcls = jinghuan.app.controllers;
        if (this.ctx.app.modules.length) {
            mcls = jinghuan.app.controllers[m || 'common'] || {};
        }
        const Cls = mcls[name];
        assert(Cls, `can not find controller: ${name}`);
        return new Cls(this.ctx);
    },
    
    /**
     *
     * @param args
     */
    // service(...args) {
    //     return jinghuan.service(...args);
    // },
    
    /**
     *
     * @param controller
     * @param actionName
     * @param m
     */
    action(controller, actionName, m) {
        let instance = controller;
        // if controller is an controller instance, ignore invoke controller method
        if (helper.isString(controller)) {
            instance = this.controller(controller, m);
        }
        let promise = Promise.resolve();
        if (instance.__before) {
            promise = Promise.resolve(instance.__before());
        }
        return promise.then(data => {
            if (data === false) return false;
            let method = `${actionName}Action`;
            if (!instance[method]) {
                method = '__call';
            }
            if (instance[method]) return instance[method]();
        }).then(data => {
            if (data === false) return false;
            if (instance.__after) return instance.__after();
            return data;
        });
    },
    
    /**
     *
     * @param filepath
     * @param filename
     */
    download(filepath, filename) {
        return this.ctx.download(filepath, filename);
    },
    
    /**
     *
     * @param name
     * @param value
     * @param options
     */
    session(name, value, options) {
        return this.ctx.session(name, value, options);
    },
    
    /**
     *
     * @param a
     * @param b
     */
    db(a, b) {
        return this.ctx.db(a, b)
    },
    
    /**
     *
     * @param msg
     */
    slog(msg) {
        this.ctx.slog.info(msg);
    }
};
