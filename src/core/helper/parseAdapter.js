//import helper from '../helper'
import merge from 'lodash/merge';

/**
 *
 * @param config
 * @param options
 * @return {*|{}}
 */
export default function (config = {}, options = {}) {
    options.type = options.type || config.type;
    let adapter = config[config.type];
    return merge({}, adapter, options);
    
    // {type: 'xxx', handle: ''}
    //if (config.handle) {
    //    const type = config.type;
    //    delete config.type;
    //    config = {type, [type]: config};
    //}
    //extConfig = extConfig.map(item => {
    //    if (!item) {
    //        return {};
    //    }
    //    // only change type
    //    // 'xxx'
    //    if (exports.isString(item)) {
    //        item = {type: item};
    //    }
    //    // {handle: 'www'}
    //    // only add some configs
    //    if (!item.type) {
    //        item = {type: config.type, [config.type]: item};
    //    }
    //    // {type: 'xxx', handle: 'www'}
    //    if (item.handle) {
    //        const type = item.type;
    //        delete item.type;
    //        item = {type, [type]: item};
    //    }
    //    return item;
    //});
    //// merge config
    //config = exports.extend({}, config, ...extConfig);
    //const value = config[config.type] || {};
    //// add type for return value
    //value.type = config.type;
    //return value;
}
