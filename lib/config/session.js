'use strict';

var fileSession = require('../core/session/file');
var dbSession = require('../core/session/db');
var path = require('path');

module.exports = {
    type: 'file',
    file: {
        handle: fileSession,
        sessionPath: path.join(jinghuan.ROOT_PATH, 'runtime/session')
    },
    db: {
        handle: dbSession,
        table: 'jh_session',
        fields: {
            key: 'id',
            content: 'data',
            expires: 'expires'
        }
    }
};