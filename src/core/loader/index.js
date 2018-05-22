import Config from './config.js';
import bootstrap from './bootstrap.js';
import Middleware from './middleware.js';
import Socket from './socket.js';
import extend from './extend.js';
import common from './common.js';
import util from './util';
import events from './events.js';
import sql from './sql.js';

/**
 * Loader
 */
class Loader {
    /**
     * constructor
     */
    constructor() {
    }
    
    /**
     * 加载项目的配置文件
     */
    loadConfig() {
        return (new Config()).load();
    }
    
    /**
     * 加载引导程序
     */
    loadBootstrap(type) {
        return bootstrap(jinghuan.APP_PATH, jinghuan.modules, type);
    }
    
    /**
     * 加载控制器
     */
    loadController() {
        return common.load(jinghuan.APP_PATH, 'controller', jinghuan.modules);
    }
    
    /**
     * 加载中间件
     * @return {*}
     */
    loadMiddleware() {
        return (new Middleware()).load();
    }
    
    /**
     *
     * @return {*}
     */
    loadSocket() {
        return (new Socket()).load();
    }
    
    
    /**
     * load extend
     */
    loadExtend(path) {
        return extend.load(path, jinghuan.modules);
    }
    
    
    /**
     * load events
     * @return {*}
     */
    loadEvents() {
        return events();
    }
    
    /**
     *
     * @return {{}}
     */
    loadSql() {
        return sql(jinghuan.APP_PATH, jinghuan.modules);
    }
}

Loader.extend = util.extend;

export default Loader;
