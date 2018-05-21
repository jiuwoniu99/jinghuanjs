'use strict';

const fs = _safeRequire('fs-extra');

const path = _safeRequire('path');

const findRoot = _safeRequire('find-root');

const set = _safeRequire('lodash/set');

const isArray = _safeRequire('lodash/isArray');

const chokidar = _safeRequire('chokidar');

const JSON = _safeRequire('json5');

function isFile(str) {
    return fs.existsSync(str) && fs.statSync(str).isFile();
}

function isDir(str) {
    return fs.existsSync(str) && fs.statSync(str).isDirectory();
}

function checkModule(name, option) {
    try {
        let p = require.resolve(name, option);
    } catch (e) {
        console.log(`npm install ${name} --save-dev`);
        process.exit(0);
    }
}

function checkFile(name, option) {
    try {
        return require.resolve(name, option);
    } catch (e) {
        console.log(`Error : file (${name}) not found`);
        process.exit(0);
    }
}

const modules = ['babel-core', 'babel-preset-env', 'babel-preset-react', 'babel-preset-stage-0', 'babel-plugin-safe-require', 'babel-plugin-transform-decorators-legacy'];

module.exports = function (str, callback) {
    let watchs = [];

    let appRootPath;
    try {
        appRootPath = findRoot(process.cwd());
    } catch (e) {
        console.log(`"${appRootPath}" Not the nodejs project directory`);
        process.exit(0);
    }
    let srcPath = path.join(appRootPath, 'src');
    let appPath = path.join(appRootPath, 'app');

    let rootPath = findRoot(__filename);

    let paths = [rootPath, appRootPath, path.join(rootPath, 'node_modules'), path.join(appRootPath, 'node_modules')];

    for (let i in modules) {
        checkModule(modules[i], { paths });
    }

    const sourceMapSupport = _safeRequire(require.resolve('source-map-support', { paths }));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }

    let keys = str.split(',');

    for (let i in keys) {
        let file = checkFile(path.join('src', keys[i], '.jinghuanjs'), { paths });
        let json = fs.readFileSync(file);
        try {
            let opt = JSON.parse(json);
            if (isArray(opt.paths)) {
                opt.paths.map(function (name) {
                    watchs.push(path.join(appRootPath, 'src', keys[i], name));
                });
            }
        } catch (e) {
            consle.log(`Error : parse file (${file}) error`);
            process.exit(0);
        }
    }

    let config = {
        exts: ['.js', '.jsx'],
        babel: {
            "presets": [[_safeRequire(require.resolve('babel-preset-env', { paths })), {
                "targets": {
                    "node": "9"
                }
            }], _safeRequire(require.resolve('babel-preset-react', { paths })), _safeRequire(require.resolve('babel-preset-stage-0', { paths }))],
            "plugins": [_safeRequire(require.resolve('babel-plugin-safe-require', { paths })), _safeRequire(require.resolve('babel-plugin-transform-decorators-legacy', { paths }))],
            "comments": false,
            "babelrc": false,
            "sourceMaps": true
        }
    };

    let babel = _safeRequire(require.resolve('babel-core', { paths }));

    chokidar.watch(watchs, {}).on('all', (event, file, stats) => {
        file = path.normalize(file);
        let resolve = file.replace(srcPath, '');
        let ext_name = path.extname(file);

        switch (event) {
            case 'change':
            case 'add':
                try {
                    if (config.exts.indexOf(ext_name) != -1) {
                        babel.transformFile(file, config.babel, function (err, result) {
                            if (err) console.error(err);else {
                                let toFile = path.join(appPath, resolve);
                                fs.writeFileSync(toFile, result.code);
                                result.map.file = toFile;
                                fs.writeFileSync(toFile + '.map', JSON.stringify(result.map));
                                console.log('out', path.join('src', resolve), ' -> ', path.join('app', resolve));
                            }
                        });
                    } else {
                        fs.copySync(file, path.join(appPath, resolve));
                        console.log('copy', path.join('src', resolve), ' -> ', path.join('app', resolve));
                    }
                } catch (e) {
                    console.error(e);
                }
                break;
            case 'addDir':
                console.log('create', path.join(appPath, resolve));
                fs.ensureDirSync(path.join('app', resolve));
                break;
            case 'unlinkDir':
            case 'unlink':
                console.log('remove', path.join('app', resolve));
                fs.removeSync(path.join(appPath, resolve));
                break;
        }
    });
};

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}
//# sourceMappingURL=babel.js.map