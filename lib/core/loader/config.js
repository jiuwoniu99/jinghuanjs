'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const path = _safeRequire('path');

const each = _safeRequire('lodash/each');

const loadFiles = _safeRequire('../helper/loadFiles');

const helper = _safeRequire('../helper');

const debug = _safeRequire('debug');

const merge = _safeRequire('lodash/merge');

const log = debug(`JH:core/loader/config[${process.pid}]`);

let Config = class Config {
    loadConfigByName(config, configPaths, name) {
        configPaths.forEach(configPath => {
            const filepath = path.join(configPath, name);
            if (helper.isFile(filepath)) {
                log(`load file: ${filepath}`);
                config = merge(config, _safeRequire(filepath));
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

        const jinghuanConfig = this.loadConfigFile(path.join(JH_PATH, 'config'));

        const commonConfig = this.loadConfigFile(path.join(ROOT_PATH, jinghuan.source, '/common/config'));

        const envConfig = this.loadConfigFile(path.join(ROOT_PATH, 'config', env));

        const paths = [path.join(JH_PATH, 'bootstrap'), path.join(ROOT_PATH, jinghuan.source, 'common/bootstrap')];

        const bootstrapConfig = this.loadConfig(paths, env);

        return merge({}, bootstrapConfig, jinghuanConfig, commonConfig, envConfig, extendConfig, true);
    }

    loadConfigFile(configPath) {
        const configFiles = loadFiles(configPath, 'js');
        const config = {};
        each(configFiles, (path, name) => {
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

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}