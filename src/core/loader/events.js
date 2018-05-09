import path from "path"
import interopRequire from '../helper/interopRequire'
//import helper from "../helper"
import each from "lodash/each"
import loadFiles from '../helper/loadFiles';

const events = {};
/**
 *
 * @return {{}}
 */
export default function load() {
    let {APP_PATH} = jinghuan;
    let {modules} = jinghuan.app;
    
    each(modules, (val) => {
        let files = loadFiles(path.join(APP_PATH, val, 'events'), 'js')
        each(files, (file, name) => {
            let event = interopRequire(file);
            events[name] = events[name] || {};
            events[name][event.index] = event.handle;
            if (!jinghuan.events.isEvent(name)) {
                jinghuan.events.on(name, async (...args) => {
                    for (let i in events[name]) {
                        await events[name][i](...args);
                    }
                })
            }
        })
    });
    return {};
};
