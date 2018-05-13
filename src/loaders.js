import path from 'path';
import Config from './core/config';
import Loader from './core/loader';

/**
 *
 * @type {module.exports}
 */
class Loaders {

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

    }

    /**
     * load app data
     */
    loadData() {
        // add data to koa application
        let events = this.loader.loadEvents();


        // jinghuan.app.models = jinghuan.loader.loadModel();
        // jinghuan.app.services = jinghuan.loader.loadService();
        // jinghuan.app.logics = jinghuan.loader.loadLogic();
        jinghuan.app.controllers = this.loader.loadController();
        // jinghuan.app.routers = jinghuan.loader.loadRouter();
        // jinghuan.app.validators = jinghuan.loader.loadValidator();
        jinghuan.app.sql = this.loader.loadSql();
    }

    /**
     * 加载中间件
     */
    loadMiddleware() {

        const middlewares = this.loader.loadMiddleware(jinghuan.app);
        middlewares.forEach(middleware => {
            jinghuan.app.use(middleware);
        });
    }

    /**
     * 加载扩展
     */
    loadExtend() {

        let {JH_PATH, ROOT_PATH} = jinghuan;

        let exts = this.loader.loadExtend(path.join(JH_PATH));

        let list = [
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

        exts = this.loader.loadExtend(path.join(ROOT_PATH, jinghuan.source, 'common'));

        list = [
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
    //loadCrontab() {
    //    const crontab = this.loader.loadCrontab();
    //    const instance = new Crontab(crontab, jinghuan.app);
    //    instance.runTask();
    //}

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
    loadAll(type) {

        this.loader = new Loader();

        const config = this.loader.loadConfig();

        jinghuan.config = Config(config);

        this.loader.loadBootstrap(type);

        if (type !== 'master') {
            // 加载 扩展
            this.loadExtend();
            this.loadData();
            this.loadMiddleware();
        }

    }
};

export default Loaders;
