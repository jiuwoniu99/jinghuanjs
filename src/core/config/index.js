import helper from '../helper';
import loadFiles from '../helper/loadFiles';
import path from 'path';
import each from 'lodash/each';
import debug from 'debug';
import LoadConfig from '../loader/config';
import at from 'lodash/at';

const log = debug('JH:core/config');
const localCache = {};
const Loader = new LoadConfig();
let Config;

/**
 *
 * @param name
 * @param config
 */
function get(name) {
    if (!name) {
        return Config;
    }

    let config = helper.extend({}, Config, localCache);
    if (name.indexOf('.') === -1) {
        return config[name];
    }
    name = name.split('.');
    const length = name.length;
    name.some((item, index) => {
        config = config[item];
        if (index !== length - 1 && !helper.isObject(config)) {
            config = undefined;
            return true;
        }
    });
    return config;
}

/**
 *
 * @param name
 * @param value
 */
function set(name, value) {
    if (name.indexOf('.') === -1) {
        localCache[name] = value;
    }

    name = name.split('.');
    const length = name.length;
    name.forEach((item, index) => {
        if (index === length - 1) {
            localCache[item] = value;
        } else {
            if (!helper.isObject(localCache[item])) {
                localCache[item] = {};
            }
            localCache = localCache[item];
        }
    });
    return localCache;
}

/**
 *
 * @param config
 * @param configPaths
 * @param name
 */
function loadConfigByName(config, configPaths, name) {
    configPaths.forEach(configPath => {
        const filepath = path.join(configPath, name);
        if (helper.isFile(filepath)) {
            log(`load file: ${filepath}`);
            config = helper.extend(config, require(filepath));
        }
    });
}

/**
 *
 * @param configPaths
 * @param env
 * @param name
 */
function loadConfig(configPaths, env, name = 'config') {
    const config = {};
    loadConfigByName(config, configPaths, `${name}.js`);
    return config;
}

/**
 *
 * @param configPath
 * @return {{}}
 */
function loadConfigFile(configPath) {
    const configFiles = loadFiles(configPath, 'js');
    const config = {};
    each(configFiles, (path, name) => {
        config[name] = require(path);
    });
    return config;
}

/**
 *
 * @param name
 * @param value
 * @return {*}
 */
function config(name, value) {

    if (!Config) {
        Config = Loader.load(localCache);
    }

    if (value === undefined) {
        return get(name);
    }
    return set(name, value);
}

export default config;
