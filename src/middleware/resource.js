import debug from 'debug';
import path from 'path';
import assert from "assert"
import helper from "../core/helper"
import send from "koa-send"


const log = debug(`JH:middleware/resource[${process.pid}]`);
/**
 *
 * @type {{root: string, publicPath: string, index: string, hidden: boolean, format: boolean, gzip: boolean, extensions: boolean, maxage: number, setHeaders: boolean, notFoundNext: boolean}}
 */
const defaultOptions = {
    root: '',
    publicPath: '/',
    index: 'index.html',
    hidden: false,
    format: true,
    gzip: false,
    extensions: false,
    maxage: 0,
    setHeaders: false,
    notFoundNext: false
};

/**
 * prefix "/" for path
 * @param path
 * @returns {*}
 */
const prefixPath = (path) => {
    if (helper.isString(path) && !path.startsWith('/')) {
        path = '/' + path;
    }
    return path;
};

/**
 * match route
 * @param path
 * @param route
 * @returns {*}
 */
const matchRoute = (path, route) => {
    if (helper.isRegExp(route)) {
        return path.match(route);
    }
    if (helper.isString(route)) {
        route = route.split('/');
        path = path.split(/\/+/);
        return route.every((item, index) => {
            if (!item || item === path[index]) {
                return true;
            }
        });
    }
};

/**
 * serve wrapper by koa-send
 * @param options
 * @returns {serve}
 */
function invokeResource(options) {
    options = helper.extend({}, defaultOptions, options || {});
    
    const root = options.root;
    assert(root, 'root directory is required to serve files');
    log('static "%s" %j', root, options);
    options.root = path.resolve(root);
    
    let publicPath = options.publicPath;
    assert(helper.isRegExp(publicPath) || helper.isString(publicPath), 'publicPath must be regexp or string');
    options.publicPath = prefixPath(publicPath);
    
    const notFoundNext = options.notFoundNext;
    
    /**
     * serve
     */
    return function serve(ctx, next) {
        if (matchRoute(ctx.path, options.publicPath) && (ctx.method === 'HEAD' || ctx.method === 'GET')) {
            return send(ctx, prefixPath(ctx.path), options).then(done => {
                if (!done && notFoundNext) {
                    return next();
                }
            });
        }
        return next();
    };
};

export default invokeResource;
