import path from "path"
import interopRequire from '../helper/interopRequire'
import helper from "../helper"
import each from "lodash/each"

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
export default function load() {
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
