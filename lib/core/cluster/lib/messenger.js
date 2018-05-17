"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _cluster = require("cluster");

var _cluster2 = _interopRequireDefault(_cluster);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _util = require("./util.js");

var _util2 = _interopRequireDefault(_util);

var _helper = require("../../helper");

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BIND_EVENT = Symbol('bind-event');
const MESSENGER = 'jinghuan-messenger';
const mapPromise = new Map();

let count = 0;

let Messenger = class Messenger extends _events2.default {
    constructor() {
        super();
        this.bindEvent();
    }

    getWorkers(type = 'all', cWorker) {
        const aliveWorkers = _util2.default.getAliveWorkers();
        if (type === 'all') return aliveWorkers;
        if (type === 'one') {
            if (!aliveWorkers.length || aliveWorkers[0] !== cWorker) return [];
            return [aliveWorkers[0]];
        }
    }

    bindEvent() {
        if (process[BIND_EVENT]) return;
        process[BIND_EVENT] = true;
        if (_cluster2.default.isMaster) {
            _cluster2.default.on('message', (worker, message) => {
                if (!message || message.act !== MESSENGER) return;
                const workers = this.getWorkers(message.target, worker);
                if (message.map) {
                    if (message.mapReturn) {
                        const map = mapPromise.get(`${message.action}_${message.taskId}`);
                        map.get(worker).resolve(message.data);
                    } else {
                        const map = new Map();
                        mapPromise.set(`${message.action}_${message.taskId}`, map);
                        const promises = workers.map(worker => {
                            worker.send(message);
                            const defer = _helper2.default.defer();
                            map.set(worker, defer);
                            return defer.promise;
                        });
                        Promise.all(promises).then(data => {
                            message.data = data;
                            message.action = `${message.action}_${message.taskId}_ret`;
                            worker.send(message);
                        });
                    }
                } else {
                    workers.forEach(worker => worker.send(message));
                }
            });
        } else {
            process.on('message', message => {
                if (!message || message.act !== MESSENGER) return;
                if (message.map && typeof message.data === 'undefined') {
                    const listener = this.listeners(message.action)[0];
                    (0, _assert2.default)(_helper2.default.isFunction(listener), `${message.action} listener must be a function`);
                    Promise.resolve(listener(message.mapData)).then(data => {
                        delete message.mapData;
                        message.data = data;
                        message.mapReturn = true;
                        process.send(message);
                    });
                } else {
                    this.emit(message.action, message.data);
                }
            });
        }
    }

    broadcast(action, data) {
        (0, _assert2.default)(this.listenerCount(action) > 0, `can not find \`${action}\` listeners`);
        process.send({
            act: MESSENGER,
            action,
            data,
            target: 'all'
        });
    }

    map(action, mapData) {
        const defer = _helper2.default.defer();
        count = count % Number.MAX_SAFE_INTEGER + 1;
        const taskId = count + '' + process.pid;
        process.send({
            act: MESSENGER,
            action,
            taskId,
            mapData,
            map: true,
            target: 'all'
        });
        this.once(`${action}_${taskId}_ret`, data => {
            defer.resolve(data);
            mapPromise.delete(action);
        });
        return defer.promise;
    }

    runInOne(callback) {
        return this.consume(callback);
    }

    consume(action, data) {
        if (_helper2.default.isFunction(action)) {
            const callback = action;
            count = count % Number.MAX_SAFE_INTEGER + 1;
            const taskId = count + '' + process.pid;
            action = `jinghuan-messenger-${taskId}`;
            this.once(action, callback);

            _helper2.default.timeout(10000).then(() => this.removeAllListeners(action));
        } else {
            (0, _assert2.default)(this.listenerCount(action) > 0, `can not find \`${action}\` listeners`);
        }
        process.send({
            act: MESSENGER,
            action,
            data,
            target: 'one'
        });
    }
};
exports.default = Messenger;