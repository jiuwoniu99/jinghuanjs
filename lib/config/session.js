const fileSession = require('think-session-file');
const path = require('path');

module.exports = {
    type: 'file',
    file: {
        handle: fileSession,
        sessionPath: path.join(jinghuan.ROOT_PATH, 'runtime/session')
    }
};
