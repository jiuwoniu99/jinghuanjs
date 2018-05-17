"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _file = require("../core/session/file");

var _file2 = _interopRequireDefault(_file);

var _db = require("../core/session/db");

var _db2 = _interopRequireDefault(_db);

var _jwt = require("../core/session/jwt");

var _jwt2 = _interopRequireDefault(_jwt);

var _aes = require("../core/session/aes");

var _aes2 = _interopRequireDefault(_aes);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    type: 'file',
    file: {
        handle: _file2.default,
        options: {
            sessionPath: _path2.default.join(jinghuan.ROOT_PATH, 'runtime/session'),
            id: 'JHFSESSID'
        }
    },
    db: {
        handle: _db2.default,
        options: {
            expires: 60 * 60 * 24 * 365,
            db_type: 'default',
            table: 'jh_session',
            id: 'JHDSESSID'
        }

    },
    jwt: {
        handle: _jwt2.default,
        options: {
            expires: 60 * 60 * 24 * 365,
            id: 'JHJSESSID',
            secret: 'jinghuanjs'
        }
    },
    aes: {
        handle: _aes2.default,
        options: {
            expires: 60 * 60 * 24 * 365,
            id: 'JHASESSID',
            secret: 'jinghuanjs'
        }
    }
};