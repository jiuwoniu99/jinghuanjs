// import helper from "../helper"
// import path from "path"
// import fs from "fs"
import Config from './config.js';
import bootstrap from './bootstrap.js';
import Middleware from './middleware.js';
// import router from "./router.js"
import extend from './extend.js';
import common from './common.js';
// import crontab from "./crontab.js"
import util from './util';
// import validator from "./validator.js"
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
     * load logic
     */
    // loadLogic() {
    //     return common.load(jinghuan.APP_PATH, 'logic', jinghuan.modules);
    // }

    /**
     * load model
     */
    // loadModel() {
    //     return common.load(jinghuan.APP_PATH, 'model', jinghuan.modules);
    // }

    /**
     * load service
     */
    // loadService() {
    //     return common.load(jinghuan.APP_PATH, 'service', jinghuan.modules);
    // }

    /**
     * 加载中间件
     * @return {*}
     */
    loadMiddleware() {
        return (new Middleware()).load();
    }

    /**
     * load router
     */
    // loadRouter() {
    //     return router.load(jinghuan.APP_PATH, jinghuan.modules);
    // }

    /**
     * load extend
     */
    loadExtend(path) {
        return extend.load(path, jinghuan.modules);
    }

    /**
     * load crontab
     */
    // loadCrontab() {
    //     return crontab(jinghuan.APP_PATH, jinghuan.modules);
    // }

    /**
     * load use defined file
     */
    // loadCommon(name) {
    //     return common.load(jinghuan.APP_PATH, name, jinghuan.modules);
    // }

    /**
     * load validator
     */
    // loadValidator() {
    //     return validator(jinghuan.APP_PATH, jinghuan.modules);
    // }

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
