"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const dbSession = _safeRequire("../core/session/db");

const jwtSession = _safeRequire("../core/session/jwt");

const aesSession = _safeRequire("../core/session/aes");

const path = _safeRequire("path");

exports.default = {
    type: 'aes',
    db: {
        handle: dbSession,
        options: {
            expires: 60 * 60 * 24 * 365,
            db_type: 'default',
            table: 'jh_session',
            id: 'JHDSESSID'
        }

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