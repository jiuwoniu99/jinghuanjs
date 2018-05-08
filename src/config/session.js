import fileSession from "../core/session/file"
import dbSession from "../core/session/db"
import path from "path"

export default {
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
