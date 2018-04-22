'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var fs = require('fs');
var Config = require('./core/config');
var Logger = require('./core/logger');
var Loader = require('./core/loader');
var helper = require('./core/helper');
var Crontab = require('./core/crontab');

require('./jinghuan.js');

/**
 *
 * @type {module.exports}
 */
module.exports = function () {

    /**
     *
     * @param options
     */
    function Loaders() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Loaders);

        this.options = options;
    }

    /**
     * init path
     */


    Loaders.prototype.initPath = function initPath() {};

    /**
     * load app data
     */


    Loaders.prototype.loadData = function loadData() {
        // add data to koa application
        // jinghuan.app.modules = this.loader.modules;
        jinghuan.app.events = this.loader.loadEvents();
        // jinghuan.app.models = jinghuan.loader.loadModel();
        // jinghuan.app.services = jinghuan.loader.loadService();
        // jinghuan.app.logics = jinghuan.loader.loadLogic();
        jinghuan.app.controllers = this.loader.loadController();
        // jinghuan.app.routers = jinghuan.loader.loadRouter();
        // jinghuan.app.validators = jinghuan.loader.loadValidator();
        jinghuan.app.sql = this.loader.loadSql();
    };

    /**
     * 加载中间件
     */


    Loaders.prototype.loadMiddleware = function loadMiddleware() {
        var middlewares = this.loader.loadMiddleware(jinghuan.app);
        middlewares.forEach(function (middleware) {
            jinghuan.app.use(middleware);
        });
    };

    /**
     * 加载扩展
     */


    Loaders.prototype.loadExtend = function loadExtend() {
        var _jinghuan = jinghuan,
            JH_PATH = _jinghuan.JH_PATH,
            ROOT_PATH = _jinghuan.ROOT_PATH;


        var exts = this.loader.loadExtend(path.join(JH_PATH));

        var list = [['jinghuan', jinghuan], ['application', jinghuan.app], ['context', jinghuan.app.context],
        // ['request', jinghuan.app.request],
        // ['response', jinghuan.app.response],
        ['controller', jinghuan.Controller.prototype]];

        list.forEach(function (item) {
            if (!exts[item[0]]) {
                return;
            }
            Loader.extend(item[1], exts[item[0]]);
        });

        exts = this.loader.loadExtend(path.join(ROOT_PATH, 'common'));

        list = [['jinghuan', jinghuan], ['application', jinghuan.app], ['context', jinghuan.app.context],
        // ['request', jinghuan.app.request],
        // ['response', jinghuan.app.response],
        ['controller', jinghuan.Controller.prototype]];

        list.forEach(function (item) {
            if (!exts[item[0]]) {
                return;
            }
            Loader.extend(item[1], exts[item[0]]);
        });
    };

    /**
     * 加载定时任务
     */


    Loaders.prototype.loadCrontab = function loadCrontab() {
        var crontab = this.loader.loadCrontab();
        var instance = new Crontab(crontab, jinghuan.app);
        instance.runTask();
    };

    /**
     * 保存配置
     * @param config
     */
    // writeConfig(config) {
    //     const configFilepath = path.join(jinghuan.ROOT_PATH, `runtime/config`);
    //     helper.mkdir(configFilepath);
    //     fs.writeFileSync(`${configFilepath}/${jinghuan.env}.json`, JSON.stringify(config, undefined, 2));
    // }

    /**
     * load all data
     */


    Loaders.prototype.loadAll = function loadAll(type, isCli) {

        this.initPath();

        this.loader = new Loader();

        var config = this.loader.loadConfig(jinghuan.env);

        jinghuan.config = Config(config);

        this.loader.loadBootstrap(type);

        if (type !== 'master') {
            // this.writeConfig(config);
            // 加载 扩展
            this.loadExtend();

            this.loadData();
            this.loadMiddleware();
            if (!isCli) {
                this.loadCrontab();
            }
        }
    };

    return Loaders;
}();