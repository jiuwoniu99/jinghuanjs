import fs from 'fs-extra';
import path from 'path';
import findRoot from 'find-root';
import set from 'lodash/set'

let paths = [];

/**
 *
 * @param name
 * @param option.requireResolve
 */
function checkModule(name, option) {
    try {
        require.resolve(name, option.requireResolve);
    } catch (e) {
        console.log(`npm install ${name} --save-dev`);
        process.exit(0);
    }
}

const modules = [
    'babel-core',
    'babel-preset-env',
    'babel-preset-react',
    'babel-preset-stage-0',
    'babel-plugin-safe-require',
    'babel-plugin-transform-decorators-legacy',
]

/**
 *
 * @param str
 * @param callback
 */
module.exports = function (str, callback) {
    for (let i in modules) {
        checkModule(modules[i], {paths});
    }
    
    let rootPath;
    
    
    try {
        rootPath = findRoot(process.cwd())
    } catch (e) {
        console.log(`"${process.cwd()}" Not the nodejs project directory`);
        process.exit(0);
    }
    
    let srcPath = path.join(rootPath, 'src');
    
    if (!fs.pathExistsSync(srcPath)) {
        console.log(`"${srcPath}" directory does not exist`);
        process.exit(0);
    }
    
    str = str.replace(/\//g, '.');
    let keys = str.split(',');
    let objects = {};
    
    
    for (let i in keys) {
        set(objects, keys[i], 1);
    }
    
    for (let app in objects) {
        let p1 = path.join(srcPath, app);
        
        if (!fs.pathExistsSync(p1)) {
            console.log(`"${p1}" directory does not exist`);
            process.exit(0);
        }
        
        for (let dir in objects[app]) {
            let p2 = path.join(p1, dir);
            
            if (!fs.pathExistsSync(p2)) {
                console.log(`"${p2}" directory does not exist`);
                process.exit(0);
            }
        }
    }
    
    console.log(objects);
}
