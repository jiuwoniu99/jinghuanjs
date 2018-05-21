'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const path = _safeRequire('path');

const Config = _safeRequire('./core/config');

const Loader = _safeRequire('./core/loader');

const define = _safeRequire('./core/helper/define');

let Loaders = class Loaders {
    constructor(options = {}) {
        this.options = options;
    }

    initPath() {}

    loadData() {
        let events = this.loader.loadEvents();

        define('controllers', this.loader.loadController());
        define('sql', this.loader.loadSql());
    }

    loadMiddleware() {
        const middlewares = this.loader.loadMiddleware();
        middlewares.forEach(middleware => {
            jinghuan.app.use(middleware);
        });
    }

    loadExtend() {

        let { JH_PATH, ROOT_PATH } = jinghuan;

        let exts = this.loader.loadExtend(path.join(JH_PATH));

        let list = [['jinghuan', jinghuan], ['application', jinghuan.app], ['context', jinghuan.app.context], ['controller', jinghuan.Controller.prototype]];

        list.forEach(item => {
            if (!exts[item[0]]) {
                return;
            }
            Loader.extend(item[1], exts[item[0]]);
        });

        exts = this.loader.loadExtend(path.join(ROOT_PATH, jinghuan.source, 'common'));

        list = [['jinghuan', jinghuan], ['application', jinghuan.app], ['context', jinghuan.app.context], ['controller', jinghuan.Controller.prototype]];

        list.forEach(item => {
            if (!exts[item[0]]) {
                return;
            }
            Loader.extend(item[1], exts[item[0]]);
        });
    }

    loadAll(type) {

        this.loader = new Loader();

        define('config', Config());

        if (type !== 'master') {
            this.loadExtend();
            this.loadData();
            this.loadMiddleware();
        }
    }
};
;

exports.default = Loaders;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}