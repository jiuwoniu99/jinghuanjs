'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _loadFiles = require('../helper/loadFiles');

var _loadFiles2 = _interopRequireDefault(_loadFiles);

var _helper = require('../helper');

var _helper2 = _interopRequireDefault(_helper);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/loader/config[${process.pid}]`);

let Config = class Config {
    loadConfigByName(config, configPaths, name) {
        configPaths.forEach(configPath => {
            const filepath = _path2.default.join(configPath, name);
            if (_helper2.default.isFile(filepath)) {
                log(`load file: ${filepath}`);
                config = (0, _merge2.default)(config, _safeRequire(filepath));
            }
        });
    }

    loadConfig(configPaths, env, name = 'config') {
        const config = {};
        this.loadConfigByName(config, configPaths, `${name}.js`);
        return config;
    }

    load(extendConfig = {}) {

        let { ROOT_PATH, JH_PATH, env } = jinghuan;

        const jinghuanConfig = this.loadConfigFile(_path2.default.join(JH_PATH, 'config'));

        const commonConfig = this.loadConfigFile(_path2.default.join(ROOT_PATH, jinghuan.source, '/common/config'));

        const envConfig = this.loadConfigFile(_path2.default.join(ROOT_PATH, 'config', env));

        const paths = [_path2.default.join(JH_PATH, 'bootstrap'), _path2.default.join(ROOT_PATH, jinghuan.source, 'common/bootstrap')];

        const bootstrapConfig = this.loadConfig(paths, env);

        return (0, _merge2.default)({}, bootstrapConfig, jinghuanConfig, commonConfig, envConfig, extendConfig, true);
    }

    loadConfigFile(configPath) {
        const configFiles = (0, _loadFiles2.default)(configPath, 'js');
        const config = {};
        (0, _each2.default)(configFiles, (path, name) => {
            config[name] = _safeRequire(path);
        });
        return config;
    }

};
exports.default = Config;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule ? obj.default : obj;
}