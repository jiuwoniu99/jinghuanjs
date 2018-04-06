const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`JH:core/loader/events[${process.pid}]`);
const helper = require('../helper');
//const _ = require('lodash');
const each = require('lodash/each');

/**
 *
 * @param dir
 * @return {{}}
 */
let loadFiles = function (dir) {
    return helper.getdirFiles(dir).filter(file => {
        return /\.js/.test(file);
    });
};

const events = {};
/**
 *
 * @return {{}}
 */
module.exports = function load() {
    let {APP_PATH} = jinghuan;
    let {modules} = jinghuan.app;
    
    each(modules, (val, name) => {
        let files = loadFiles(path.join(APP_PATH, val, 'events'))
        each(files, (file) => {
            //console.log(file);
            let event = interopRequire(path.join(APP_PATH, val, 'events', file), true);
            let [index, callback] = event;
            let name = file.replace(/\\/g, '/').replace(/\.js/, '');
            
            events[name] = events[name] || {};
            events[name][index] = callback;
            //console.log(callback)
            if (!jinghuan.events.isEvent(name)) {
                jinghuan.events.on(name, async (...args) => {
                    //console.log(events);
                    for (let i in events[name]) {
                        await events[name][i](...args);
                    }
                })
            }
        })
        
    });
    return {};
};
