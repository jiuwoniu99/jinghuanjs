import helper from './index';
import path from 'path';
import isString from 'lodash/isString'

/**
 *
 * @param dir 目录
 * @param ext 文件扩展名
 * @param load 是否使用require加载
 */
export default function(dir, ext = [], load = false) {
    if (isString(ext)) {
        ext = [ext];
    }
    const ragexp = new RegExp('\\.(' + ext.join('|') + ')$');
    const cache = {};

    helper.getdirFiles(dir)
    .filter(file => {
        return ragexp.test(file);
    })
    .forEach(file => {
        const name = file.replace(/\\/g, '/').replace(ragexp, '');
        if (load) {
            cache[name] = require(path.join(dir, file));
        } else {
            cache[name] = path.join(dir, file);
        }

    });
    return cache;
};
