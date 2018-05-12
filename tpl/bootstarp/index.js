const Application = require('jinghuanjs');

Application({
    port: 8049,
    //host: ['www.jinghuan.info'],              // default [127.0.0.1]
    source: "src",                              // default app
    //ROOT_PATH: path.resolve(__dirname, '..'), // default nodejs project path
    //watcher: true,                            // source=src -> watcher=true
    //env: 'test',                              // default __filename
    //modules: ['test'],                        // default __filename
});
