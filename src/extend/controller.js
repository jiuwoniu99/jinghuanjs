import debug from 'debug';
import isString from 'lodash/isString';

const log = debug('JH:extend/controller');
/**
 * extend controller
 */
export default {
    
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
     * @param name
     * @param value
     * @return {*}
     */
    config(name, value) {
        return jinghuan.config(name, value);
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
        if (value === undefined && isString(name)) {
            return this.ctx.header[name];
        }
        if (this.ctx.res.headersSent) {
            log(`headers has already sent, url: ${this.ctx.url}`);
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
     * @param controller
     * @param actionName
     * @param m
     */
    //action(controller, actionName, m) {
    //    let instance = controller;
    //    // if controller is an controller instance, ignore invoke controller method
    //    if (isString(controller)) {
    //        instance = this.controller(controller, m);
    //    }
    //    let promise = Promise.resolve();
    //    if (instance.__before) {
    //        promise = Promise.resolve(instance.__before());
    //    }
    //    return promise.then(data => {
    //        if (data === false) {
    //            return false;
    //        }
    //        let method = `${actionName}Action`;
    //        if (!instance[method]) {
    //            method = '__call';
    //        }
    //        if (instance[method]) {
    //            return instance[method]();
    //        }
    //    }).then(data => {
    //        if (data === false) {
    //            return false;
    //        }
    //        if (instance.__after) {
    //            return instance.__after();
    //        }
    //        return data;
    //    });
    //},
    
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
     * @param tableName
     * @param dbType
     * @return {*}
     */
    db(tableName, dbType) {
        return this.ctx.db(tableName, dbType);
    },
    
    /**
     *
     * @param msg
     */
    get slog() {
        return this.ctx.slog;
    }
};
