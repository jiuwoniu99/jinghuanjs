#!/usr/bin/env node
'use strict';

const pkg = _safeRequire('../package.json');

const fs = _safeRequire('fs-extra');

const path = _safeRequire('path');

const findRoot = _safeRequire('find-root');

const program = _safeRequire('commander');

const isString = _safeRequire('lodash/isString');

const child_process = _safeRequire('child_process');

const cluster = _safeRequire('cluster');

program.version(pkg.version).option('-P, --port [n]', 'set port                       -P 8409             ', '8409').option('-H, --host [value]', 'set host                       -H 127.0.0.1,...    ', '127.0.0.1').option('-S, --source [value]', 'set source                     -S app|src          ', 'app').option('-R, --root-path [value]', 'set root path                  -R /[you work path] ', './').option('-E, --env [value]', 'set env                        -E index            ', 'index').option('-M, --modules [value]', 'set modules                    -M index,...        ', 'index').option('-C, --config [value]', 'set config file path           -C config.js        ', null).option('-W, --workers [n]', 'set workers number             -W 1                ', 1).option('demo', 'run demo                                           ').option('babel [value]', '                                                   ').parse(process.argv);

function demo(tplPath) {}

if (program.babel) {
    _safeRequire('../babel')(isString(program.babel) ? program.babel : '', function (option) {});
} else if (program.demo) {
    let tplPath = path.join(__dirname, '../tpl');
    _safeRequire('../index.js')({
        ROOT_PATH: tplPath,
        source: 'src',
        port: 8409,
        env: 'index',
        modules: ['index'],
        workers: 1,
        mode: 'lib'
    });
} else {
    const rootPath = findRoot(__filename);

    try {
        findRoot(process.cwd());
    } catch (e) {
        console.log(`"${process.cwd()}" Not the nodejs project directory`);
        process.exit(0);
    }
    const appRootPath = findRoot(process.cwd());
    const requireResolve = { paths: [appRootPath, rootPath] };

    let options = {};

    if (program.config) {
        try {
            let file = require.resolve(program.config, requireResolve);
            options = _safeRequire(file);
            options.port = options.port || program.port;
            options.host = options.host || program.host.split(',');
            options.source = options.source || program.source;
            options.ROOT_PATH = options.ROOT_PATH || program['root-path'] || appRootPath;
            options.env = options.env || program.env;
            options.modules = options.modules || program.modules.split(',');
            options.workers = options.workers || program.workers;

            let sourcePath = `${options.ROOT_PATH}/${options.source}`;
            if (!fs.pathExistsSync(sourcePath)) {
                console.log(`The "${sourcePath}" has not been found`);
                process.exit(0);
            }
        } catch (e) {
            console.log(`file "${program.config}" has not been found`);
            process.exit(0);
        }
        _safeRequire('../index.js')(options);
    } else {

        options.port = program.port;

        options.host = program.host.split(',');

        options.source = program.source;

        options.ROOT_PATH = program['root-path'] || appRootPath;

        let sourcePath = `${options.ROOT_PATH}/${options.source}`;
        if (!fs.pathExistsSync(sourcePath)) {
            console.log(`The "${sourcePath}" has not been found`);
            process.exit(0);
        }

        options.env = program.env;

        options.modules = program.modules.split(',');

        options.workers = program.workers;

        _safeRequire('../index.js')(options);
    }
}

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
//# sourceMappingURL=cli.js.map