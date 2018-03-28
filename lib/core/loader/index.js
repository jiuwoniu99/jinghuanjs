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
    constructor(appPath, jinghuanPath) {
        // 应用程序目录
        this.appPath = appPath;
        // 核心库目录
        this.jinghuanPath = jinghuanPath;
        // 应用程序需要加在的模块
        this.modules = jinghuan.modules;
    }

    /**
     * 加载项目的配置文件
     */
    loadConfig(env) {
        return (new Config()).load(this.appPath, this.jinghuanPath, env, this.modules);
    }

    /**
     * 加载引导程序
     */
    loadBootstrap(type) {
        return bootstrap(this.appPath, this.modules, type);
    }

    /**
     * 加载控制器
     */
    loadController() {
        return common.load(this.appPath, 'controller', this.modules);
    }

    /**
     * load logic
     */
    loadLogic() {
        return common.load(this.appPath, 'logic', this.modules);
    }

    /**
     * load model
     */
    loadModel() {
        return common.load(this.appPath, 'model', this.modules);
    }

    /**
     * load service
     */
    loadService() {
        return common.load(this.appPath, 'service', this.modules);
    }

    /**
     * 加载中间件
     */
    loadMiddleware(app) {
        return (new Middleware()).load(this.appPath, this.jinghuanPath, this.modules, app);
    }

    /**
     * load router
     */
    loadRouter() {
        return router.load(this.appPath, this.modules);
    }

    /**
     * load extend
     */
    loadExtend() {
        return extend.load(this.appPath, this.jinghuanPath, this.modules);
    }

    /**
     * load crontab
     */
    loadCrontab() {
        return crontab(this.appPath, this.modules);
    }

    /**
     * load use defined file
     */
    loadCommon(name) {
        return common.load(this.appPath, name, this.modules);
    }

    /**
     * load validator
     */
    loadValidator() {
        return validator(this.appPath, this.modules);
    }

    /**
     * load events
     * @return {*}
     */
    loadEvents() {
        return events(this.appPath, this.modules);
    }

    /**
     *
     * @return {{}}
     */
    loadSql() {
        return sql(this.appPath, this.modules);
    }
}

Loader.extend = extendMethod;

module.exports = Loader;
