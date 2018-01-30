const fileSession = require('../core/session/file');
const dbSession = require('../core/session/db');
const path = require('path');

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
