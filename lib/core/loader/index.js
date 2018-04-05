const helper = require('../helper');
const path = require('path');
const fs = require('fs');
const Config = require('./config.js');
const bootstrap = require('./bootstrap.js');
const Middleware = require('./middleware.js');
const router = require('./router.js');
const extend = require('./extend.js');
const common = require('./common.js');
const crontab = require('./crontab.js');
const extendMethod = require('./util.js').extend;
const validator = require('./validator.js');
const events = require('./events.js');
const sql = require('./sql.js');

/**
 * Loader
 */
class Loader {
    /**
     * constructor
     */
    constructor() {
        // 应用程序目录
        //jinghuan.APP_PATH = appPath;
        // 核心库目录
        //jinghuan.JH_PATH = jinghuanPath;
        // 应用程序需要加在的模块
        //jinghuan.modules = jinghuan.modules;
    }

    /**
     * 加载项目的配置文件
     */
    loadConfig(env) {
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
     * load logic
     */
    loadLogic() {
        return common.load(jinghuan.APP_PATH, 'logic', jinghuan.modules);
    }

    /**
     * load model
     */
    loadModel() {
        return common.load(jinghuan.APP_PATH, 'model', jinghuan.modules);
    }

    /**
     * load service
     */
    loadService() {
        return common.load(jinghuan.APP_PATH, 'service', jinghuan.modules);
    }

    /**
     * 加载中间件
     */
    loadMiddleware(app) {
        return (new Middleware()).load(jinghuan.APP_PATH, jinghuan.JH_PATH, jinghuan.modules, app);
    }

    /**
     * load router
     */
    loadRouter() {
        return router.load(jinghuan.APP_PATH, jinghuan.modules);
    }

    /**
     * load extend
     */
    loadExtend(path) {
        return extend.load(path, jinghuan.modules);
    }

    /**
     * load crontab
     */
    loadCrontab() {
        return crontab(jinghuan.APP_PATH, jinghuan.modules);
    }

    /**
     * load use defined file
     */
    loadCommon(name) {
        return common.load(jinghuan.APP_PATH, name, jinghuan.modules);
    }

    /**
     * load validator
     */
    loadValidator() {
        return validator(jinghuan.APP_PATH, jinghuan.modules);
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

Loader.extend = extendMethod;

module.exports = Loader;
