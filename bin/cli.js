#!/usr/bin/env node

let program = require('commander');
let main = require('../index.js');
let fs = require('fs-extra');
let path = require('path');

const pkg = require('../package.json');
let options = {};

program
    .version(pkg.version)
    .option('new [value]',
        'create new project             new [project name]')
    .option('demo [value]',
        'run demo                       demo')
    .option('-P, --port [n]',
        'set port default 8409          -P 8409',
        '8409')
    .option('-H, --host [value]',
        'set host default 127.0.0.1     -H 127.0.0.1, ...',)
    .option('-S, --source [value]',
        'set source default app         -S app|src',
        'app')
    .option('-R, --root-path [value]',
        'set root path default ./       -R /[you work path]',
        process.cwd())
    .option('-E, --env [value]',
        'set env default index          -E index',
        'index')
    .option('-M, --modules [value]',
        'set modules default index      -M index, ...',
        'index')
    .option('-W, --watcher [value]',
        'set watcher default false      -W')
    .option('-C, --config [value]',
        'set config file path           -C config.js')
    .parse(process.argv);


if (program.new) {

}
else if (program.demo) {
    main({
        ROOT_PATH: path.join(__dirname, '../tpl'),
        source: 'src',
        port: 8409,
        env: 'index',
        modules: ['index'],
        watcher: true
    });
}
else if (program.config) {
    if (fs.pathExistsSync(program.config)) {
        options = require(program.config);
    } else {
        console.log(`file "${program.config}" not find`);
        process.exit(0)
    }
} else {
    if (program.port) {
        options.port = program.port * 1;
    } else {
        options.port = 8409
    }
    
    if (program.host) {
        options.host = program.host.split(',');
    }
    
    if (program.source) {
        options.source = program.source;
    } else {
        options.source = 'app';
    }
    
    if (program['root-path']) {
        options.ROOT_PATH = program['root-path'];
    } else {
        options.ROOT_PATH = process.cwd();
    }
    
    let sourcePath = `${options.ROOT_PATH}/${options.source}`;
    if (!fs.pathExistsSync(sourcePath)) {
        console.log(`The "${sourcePath}" has not been found`);
        process.exit(0)
    }
    
    
    if (program.env) {
        options.env = program.env;
    } else {
        options.env = 'index';
    }
    
    if (program.modules) {
        options.modules = program.modules.split(',');
    } else {
        options.modules = ['index']
    }
    
    if (program.watcher) {
        options.watcher = true;
    } else {
        options.watcher = false;
    }
    main(options);
}
