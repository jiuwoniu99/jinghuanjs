import path from 'path';
import each from 'lodash/each';
import loadFiles from '../helper/loadFiles';

const events = {};

/**
 *
 */
export default function load() {
    let {APP_PATH, modules} = jinghuan;

    each(modules, (module) => {
        let files = loadFiles(path.join(APP_PATH, module, 'events'), 'js');
        each(files, (file, name) => {
            let event = require(file);
            events[name] = events[name] || {};
            events[name][event.index] = event.handle;

            if (!jinghuan.events.isEvent(name)) {
                jinghuan.events.on(name, async(...args) => {
                    for (let i in events[name]) {
                        await events[name][i](...args);
                    }
                });
            }
        });
    });
    return events;

};
