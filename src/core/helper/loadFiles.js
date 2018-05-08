import helper from "./index"
import path from "path"

export default function(dir, ext) {
    const ragexp = new RegExp('\\.' + ext + '$');
    const files = helper.getdirFiles(dir).filter(file => {
        return ragexp.test(file);
    });
    const cache = {};
    files.forEach(file => {
        const name = file.replace(/\\/g, '/').replace(ragexp, '');
        const filepath = path.join(dir, file);
        cache[name] = filepath;
    });
    return cache;
};
