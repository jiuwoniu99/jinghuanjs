import fs from 'fs-extra';
import path from 'path';
import findRoot from 'find-root';
import set from 'lodash/set'
import isArray from 'lodash/isArray';
import chokidar from 'chokidar'
import JSON from 'json5';


function isFile(str) {
    return fs.existsSync(str) && fs.statSync(str).isFile();
}

function isDir(str) {
    return fs.existsSync(str) && fs.statSync(str).isDirectory();
}

/**
 *
 * @param name
 * @param option.requireResolve
 */
function checkModule(name, option) {
    try {
        require.resolve(name, option);
    } catch (e) {
        console.log(`npm install ${name} --save-dev`);
        process.exit(0);
    }
}

/**
 *
 * @param name
 * @param option
 * @return {*}
 */
function checkFile(name, option) {
    try {
        return require.resolve(name, option);
    } catch (e) {
        console.log(`Error : file (${name}) not found`);
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
    let watchs = [];
    
    let appRootPath;
    try {
        appRootPath = findRoot(process.cwd());
    } catch (e) {
        console.log(`"${appRootPath}" Not the nodejs project directory`);
        process.exit(0);
    }
    let appSrcPath = path.join(appRootPath, 'src');
    let appLibPath = path.join(appRootPath, 'lib');
    
    let rootPath = findRoot(__filename);
    
    let paths = [
        appRootPath,
        rootPath,
        path.join(appRootPath, 'node_modules'),
        path.join(rootPath, 'node_modules'),
    ];
    
    for (let i in modules) {
        checkModule(modules[i], {paths});
    }
    
    const sourceMapSupport = require(require.resolve('source-map-support', {paths}));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }
    
    let keys = str.split(',');
    
    for (let i in keys) {
        let file = checkFile(path.join('src', keys[i], '.jinghuanjs'), {paths});
        let json = fs.readFileSync(file);
        try {
            let opt = JSON.parse(json);
            if (isArray(opt.paths)) {
                opt.paths.map(function (name) {
                    watchs.push(path.join(appRootPath, 'src', keys[i], name))
                })
            }
            
        } catch (e) {
            consle.log(`Error : parse file (${file}) error`);
            process.exit(0);
        }
    }
    
    
    let config = {
        exts: ['.js', '.jsx'],
        babel: {
            "presets": [
                [
                    require(require.resolve('babel-preset-env', {paths})),
                    {
                        "targets": {
                            "node": "9"
                        }
                    }
                ],
                require(require.resolve('babel-preset-react', {paths})),
                require(require.resolve('babel-preset-stage-0', {paths})),
            ],
            "plugins": [
                require(require.resolve('babel-plugin-safe-require', {paths})),
                require(require.resolve('babel-plugin-transform-decorators-legacy', {paths})),
            ],
            "comments": false,
            "babelrc": false,
            "sourceMaps": true,
        }
    };
    
    
    let babel = require(require.resolve('babel-core', {paths}));
    
    chokidar.watch(watchs, {})
        .on('all', (event, file, stats) => {
            file = path.normalize(file);
            let resolve = file.replace(appSrcPath, '');
            let ext_name = path.extname(file);
            
            switch (event) {
                case 'change':
                case 'add':
                    try {
                        if (config.exts.indexOf(ext_name) != -1) {
                            babel.transformFile(file, config.babel, function (err, result) {
                                if (err)
                                    console.error(err);
                                else {
                                    let toFile = path.join(appLibPath, resolve);
                                    fs.writeFileSync(toFile, result.code);
                                    result.map.file = toFile;
                                    fs.writeFileSync(toFile + '.map', JSON.stringify(result.map));
                                    console.log('out', path.join('app', resolve), ' -> ', path.join('lib', resolve));
                                }
                            });
                        } else {
                            fs.copySync(file, path.join(appLibPath, resolve));
                            console.log('copy', path.join('app', resolve), ' -> ', path.join('lib', resolve));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case 'addDir':
                    console.log('create', path.join(appLibPath, resolve));
                    fs.ensureDirSync(path.join('lib', resolve));
                    break;
                case 'unlinkDir':
                case 'unlink':
                    console.log('remove', path.join('lib', resolve));
                    fs.removeSync(path.join(appLibPath, resolve));
                    break;
            }
        });
    
    //console.log(watchs);
}
