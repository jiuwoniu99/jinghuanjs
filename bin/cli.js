#!/usr/bin/env node

let program = require('commander');
let main = require('../index.js');
let fs = require('fs-extra');
let path = require('path');

const pkg = require('../package.json');
let options = {};

program
    .version(pkg.version)
    //.option('new [value]',
    //    'create new project             new [project name]')
    .option('-P, --port [n]',
        'set port                       -P 8409             ',
        '8409')
    .option('-H, --host [value]',
        'set host                       -H 127.0.0.1,...    ',
        '127.0.0.1')
    .option('-S, --source [value]',
        'set source                     -S app|src          ',
        'app')
    .option('-R, --root-path [value]',
        'set root path                  -R /[you work path] ',
        './')
    .option('-E, --env [value]',
        'set env                        -E index            ',
        'index')
    .option('-M, --modules [value]',
        'set modules                    -M index,...        ',
        'index')
    .option('-C, --config [value]',
        'set config file path           -C config.js        ',
        null)
    .option('-W, --workers [n]',
        'set workers number             -W 1                ',
        1)
    .option('demo',
        'run demo                                           ')
    .parse(process.argv);


if (program.new) {

}
else if (program.demo) {
    //console.log(`jinghuanjs -R ${process.pwd()}`)
    main({
        ROOT_PATH: path.join(__dirname, '../tpl'),
        source: 'src',
        port: 8409,
        env: 'index',
        modules: ['index'],
        workers: 1,
        mode: 'lib'
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
    options.port = program.port;
    
    options.host = program.host.split(',');
    
    options.source = program.source;
    
    options.ROOT_PATH = program['root-path'];
    
    let sourcePath = `${options.ROOT_PATH}/${options.source}`;
    if (!fs.pathExistsSync(sourcePath)) {
        console.log(`The "${sourcePath}" has not been found`);
        process.exit(0)
    }
    
    options.env = program.env;
    
    options.modules = program.modules.split(',');
    
    options.workers = program.workers;
    
    main(options);
}
