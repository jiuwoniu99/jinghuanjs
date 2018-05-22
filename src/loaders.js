import path from 'path';
import Config from './core/config';
import Loader from './core/loader';
import define from './core/helper/define';

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
        let events = this.loader.loadEvents();
        define('controllers', this.loader.loadController());
        define('sql', this.loader.loadSql());
    }
    
    /**
     * 加载中间件
     */
    loadMiddleware() {
        const middlewares = this.loader.loadMiddleware();
        middlewares.forEach(middleware => {
            jinghuan.app.use(middleware);
        });
    }
    
    /**
     * 加载中间件
     */
    loadSocket() {
        const sockets = this.loader.loadSocket();
        sockets.forEach(socket => {
            jinghuan.app.ws.use(socket);
        });
    }
    
    /**
     * 加载扩展
     */
    loadExtend() {
        
        let {
            JH_PATH,
            ROOT_PATH
        } = jinghuan;
        
        let exts = this.loader.loadExtend(path.join(JH_PATH));
        
        let list = [
            ['jinghuan', jinghuan],
            ['application', jinghuan.app],
            ['context', jinghuan.app.context],
            ['controller', jinghuan.Controller.prototype],
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
        define('config', Config());
        if (type !== 'master') {
            // 加载 扩展
            this.loadExtend();
            this.loadData();
            this.loadMiddleware();
            this.loadSocket()
        }
    }
};

export default Loaders;
