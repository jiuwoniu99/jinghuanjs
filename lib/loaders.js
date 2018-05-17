'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('./core/config');

var _config2 = _interopRequireDefault(_config);

var _loader = require('./core/loader');

var _loader2 = _interopRequireDefault(_loader);

var _define = require('./core/helper/define');

var _define2 = _interopRequireDefault(_define);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Loaders = class Loaders {
    constructor(options = {}) {
        this.options = options;
    }

    initPath() {}

    loadData() {
        let events = this.loader.loadEvents();

        jinghuan.app.controllers = this.loader.loadController();

        jinghuan.app.sql = this.loader.loadSql();
    }

    loadMiddleware() {
        const middlewares = this.loader.loadMiddleware();
        middlewares.forEach(middleware => {
            jinghuan.app.use(middleware);
        });
    }

    loadExtend() {

        let { JH_PATH, ROOT_PATH } = jinghuan;

        let exts = this.loader.loadExtend(_path2.default.join(JH_PATH));

        let list = [['jinghuan', jinghuan], ['application', jinghuan.app], ['context', jinghuan.app.context], ['controller', jinghuan.Controller.prototype]];

        list.forEach(item => {
            if (!exts[item[0]]) {
                return;
            }
            _loader2.default.extend(item[1], exts[item[0]]);
        });

        exts = this.loader.loadExtend(_path2.default.join(ROOT_PATH, jinghuan.source, 'common'));

        list = [['jinghuan', jinghuan], ['application', jinghuan.app], ['context', jinghuan.app.context], ['controller', jinghuan.Controller.prototype]];

        list.forEach(item => {
            if (!exts[item[0]]) {
                return;
            }
            _loader2.default.extend(item[1], exts[item[0]]);
        });
    }

    loadAll(type) {

        this.loader = new _loader2.default();

        (0, _define2.default)('config', (0, _config2.default)());

        if (type !== 'master') {
            this.loadExtend();
            this.loadData();
            this.loadMiddleware();
        }
    }
};
;

exports.default = Loaders;