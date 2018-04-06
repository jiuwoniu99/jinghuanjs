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
        return bootstrap(jinghuan.APP_PATH, jinghuan.app.modules, type);
    }

    /**
     * 加载控制器
     */
    loadController() {
        return common.load(jinghuan.APP_PATH, 'controller', jinghuan.app.modules);
    }

    /**
     * load logic
     */
    loadLogic() {
        return common.load(jinghuan.APP_PATH, 'logic', jinghuan.app.modules);
    }

    /**
     * load model
     */
    loadModel() {
        return common.load(jinghuan.APP_PATH, 'model', jinghuan.app.modules);
    }

    /**
     * load service
     */
    loadService() {
        return common.load(jinghuan.APP_PATH, 'service', jinghuan.app.modules);
    }

    /**
     * 加载中间件
     */
    loadMiddleware(app) {
        return (new Middleware()).load(jinghuan.APP_PATH, jinghuan.JH_PATH, jinghuan.app.modules, app);
    }

    /**
     * load router
     */
    loadRouter() {
        return router.load(jinghuan.APP_PATH, jinghuan.app.modules);
    }

    /**
     * load extend
     */
    loadExtend(path) {
        return extend.load(path, jinghuan.app.modules);
    }

    /**
     * load crontab
     */
    loadCrontab() {
        return crontab(jinghuan.APP_PATH, jinghuan.app.modules);
    }

    /**
     * load use defined file
     */
    loadCommon(name) {
        return common.load(jinghuan.APP_PATH, name, jinghuan.app.modules);
    }

    /**
     * load validator
     */
    loadValidator() {
        return validator(jinghuan.APP_PATH, jinghuan.app.modules);
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
        return sql(jinghuan.APP_PATH, jinghuan.app.modules);
    }
}

Loader.extend = extendMethod;

module.exports = Loader;
