import dbSession from "../core/session/db";
import jwtSession from "../core/session/jwt";
import aesSession from '../core/session/aes';

import path from "path"

export default {
    type: 'aes',
    db: {
        handle: dbSession,
        options: {
            expires: 60 * 60 * 24 * 365,
            db_type: 'default',
            table: 'jh_session',
            id: 'JHDSESSID'
        },
        
    },
    jwt: {
        handle: jwtSession,
        options: {
            expires: 60 * 60 * 24 * 365,
            id: 'JHJSESSID',
            secret: 'jinghuanjs'
        }
    },
    aes: {
        handle: aesSession,
        options: {
            expires: 60 * 60 * 24 * 365,
            id: 'JHASESSID',
            secret: 'jinghuanjs'
        }
    }
};
