const path = require('path');
const fs = require('fs');
const Config = require('./core/config');
const Logger = require('./core/logger');
const Loader = require('./core/loader');
const helper = require('./core/helper');
const Crontab = require('./core/crontab');

require('./jinghuan.js');

const jinghuanPath = path.join(__dirname, '..');

/**
 *
 * @type {module.exports}
 */
module.exports = class {

    /**
     *
     * @param options
     */
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * init path
     */
    initPath() {
        jinghuan.ROOT_PATH = this.options.ROOT_PATH;
        jinghuan.APP_PATH = this.options.APP_PATH;

        // set env
        if (this.options.env) {
            jinghuan.app.env = this.options.env;
        }

        // set proxy
        if (this.options.proxy) {
            jinghuan.app.proxy = this.options.proxy;
        }
    }

    /**
     * load app data
     */
    loadData() {
        // add data to koa application
        jinghuan.app.modules = jinghuan.loader.modules;
        jinghuan.app.events = jinghuan.loader.loadEvents();
        // jinghuan.app.models = jinghuan.loader.loadModel();
        //jinghuan.app.services = jinghuan.loader.loadService();
        //jinghuan.app.logics = jinghuan.loader.loadLogic();
        jinghuan.app.controllers = jinghuan.loader.loadController();
        //jinghuan.app.routers = jinghuan.loader.loadRouter();
        //jinghuan.app.validators = jinghuan.loader.loadValidator();
        jinghuan.app.sql = jinghuan.loader.loadSql();
    }

    /**
     * 加载中间件
     */
    loadMiddleware() {
        const middlewares = jinghuan.loader.loadMiddleware(jinghuan.app);
        middlewares.forEach(middleware => {
            jinghuan.app.use(middleware);
        });
    }

    /**
     * 加载扩展
     */
    loadExtend() {
        const exts = jinghuan.loader.loadExtend();

        const list = [
            ['jinghuan', jinghuan],
            ['application', jinghuan.app],
            ['context', jinghuan.app.context],
            // ['request', jinghuan.app.request],
            // ['response', jinghuan.app.response],
            ['controller', jinghuan.Controller.prototype],
            //['logic', jinghuan.Logic.prototype],
            //['service', jinghuan.Service.prototype]
        ];
        list.forEach(item => {
            if (!exts[item[0]]) {
                return;
            }
            Loader.extend(item[1], exts[item[0]]);
        });
    }

    /**
     * 加载定时任务
     */
    loadCrontab() {
        const crontab = jinghuan.loader.loadCrontab();
        const instance = new Crontab(crontab, jinghuan.app);
        instance.runTask();
    }

    /**
     * 保存配置
     * @param config
     */
    writeConfig(config) {
        const configFilepath = path.join(jinghuan.ROOT_PATH, `runtime/config`);
        helper.mkdir(configFilepath);
        fs.writeFileSync(`${configFilepath}/${jinghuan.app.env}.json`, JSON.stringify(config, undefined, 2));
    }

    /**
     * load all data
     */
    loadAll(type, isCli) {

        this.initPath();

        jinghuan.loader = new Loader(jinghuan.APP_PATH, jinghuanPath);

        // write config to APP_PATH/runtime/config/[env].json file
        const config = jinghuan.loader.loadConfig(jinghuan.app.env);

        jinghuan.config = Config(config);

        jinghuan.logger = new Logger(helper.parseAdapterConfig(jinghuan.config('logger')), true);

        jinghuan.loader.loadBootstrap(type);

        if (type !== 'master') {
            this.writeConfig(config);
            this.loadExtend();
            this.loadData();
            this.loadMiddleware();
            if (!isCli) {
                this.loadCrontab();
            }
        }

    }
};

