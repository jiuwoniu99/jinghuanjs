const helper = require('../helper');
const each = require('lodash/each');

/**
 * config manage
 */
class Config {
    /**
     * constructor
     * @param {config} config data
     */
    constructor(config = {}) {
        this.config = config;
    }

    /**
     *
     * @param name
     * @param config
     * @return {*}
     */
    get(name, config) {
        if (!name) {
            return this.config;
        }
        config = config || this.config;
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
     * set config
     * set('name', 'value'), set('foo.bar', 'value')
     */
    set(name, value) {
        if (name.indexOf('.') === -1) {
            this.config[name] = value;
        }
        let config = this.config;
        name = name.split('.');
        const length = name.length;
        name.forEach((item, index) => {
            if (index === length - 1) {
                config[item] = value;
            } else {
                if (!helper.isObject(config[item])) {
                    config[item] = {};
                }
                config = config[item];
            }
        });
        return this;
    }
}

/**
 *
 * @param configs
 * @return {function(*=, *=)}
 */
function getConfigFn(configs) {
    const configInstances = new Config(configs);
    return (name, value) => {
        let conf = configInstances;
        if (value === undefined) {
            return conf.get(name);
        }
        return conf.set(name, value);
    };
}

module.exports = getConfigFn;
