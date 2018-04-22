'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cluster = require('cluster');
var events = require('events');
var assert = require('assert');
//const _ = require('lodash');
//
var util = require('./util.js');
var helper = require('../../helper');
//
var BIND_EVENT = Symbol('bind-event');
var MESSENGER = 'jinghuan-messenger';
var mapPromise = new Map();

// task counter
var count = 0;

/**
 * Messenger class
 */

var Messenger = function (_events) {
    _inherits(Messenger, _events);

    function Messenger() {
        _classCallCheck(this, Messenger);

        var _this = _possibleConstructorReturn(this, _events.call(this));

        _this.bindEvent();
        return _this;
    }

    /**
     *
     * @param type
     * @param cWorker
     * @return {*}
     */


    Messenger.prototype.getWorkers = function getWorkers() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';
        var cWorker = arguments[1];

        var aliveWorkers = util.getAliveWorkers();
        if (type === 'all') return aliveWorkers;
        if (type === 'one') {
            if (!aliveWorkers.length || aliveWorkers[0] !== cWorker) return [];
            return [aliveWorkers[0]];
        }
    };

    /**
     *
     */


    Messenger.prototype.bindEvent = function bindEvent() {
        var _this2 = this;

        if (process[BIND_EVENT]) return;
        process[BIND_EVENT] = true;
        if (cluster.isMaster) {
            cluster.on('message', function (worker, message) {
                if (!message || message.act !== MESSENGER) return;
                var workers = _this2.getWorkers(message.target, worker);
                if (message.map) {
                    if (message.mapReturn) {
                        var map = mapPromise.get(message.action + '_' + message.taskId);
                        map.get(worker).resolve(message.data);
                    } else {
                        var _map = new Map();
                        mapPromise.set(message.action + '_' + message.taskId, _map);
                        var promises = workers.map(function (worker) {
                            worker.send(message);
                            var defer = helper.defer();
                            _map.set(worker, defer);
                            return defer.promise;
                        });
                        Promise.all(promises).then(function (data) {
                            message.data = data;
                            message.action = message.action + '_' + message.taskId + '_ret';
                            worker.send(message);
                        });
                    }
                } else {
                    workers.forEach(function (worker) {
                        return worker.send(message);
                    });
                }
            });
        } else {
            process.on('message', function (message) {
                if (!message || message.act !== MESSENGER) return;
                if (message.map && typeof message.data === 'undefined') {
                    var listener = _this2.listeners(message.action)[0];
                    assert(helper.isFunction(listener), message.action + ' listener must be a function');
                    Promise.resolve(listener(message.mapData)).then(function (data) {
                        delete message.mapData;
                        message.data = data;
                        message.mapReturn = true;
                        process.send(message);
                    });
                } else {
                    _this2.emit(message.action, message.data);
                }
            });
        }
    };

    /**
     *
     * @param action
     * @param data
     */


    Messenger.prototype.broadcast = function broadcast(action, data) {
        assert(this.listenerCount(action) > 0, 'can not find `' + action + '` listeners');
        process.send({
            act: MESSENGER,
            action: action,
            data: data,
            target: 'all'
        });
    };

    /**
     * @param action
     * @param mapData
     */


    Messenger.prototype.map = function map(action, mapData) {
        var defer = helper.defer();
        count = count % Number.MAX_SAFE_INTEGER + 1;
        var taskId = count + '' + process.pid;
        process.send({
            act: MESSENGER,
            action: action,
            taskId: taskId,
            mapData: mapData,
            map: true,
            target: 'all'
        });
        this.once(action + '_' + taskId + '_ret', function (data) {
            defer.resolve(data);
            mapPromise.delete(action);
        });
        return defer.promise;
    };

    /**
     * @param callback
     */


    Messenger.prototype.runInOne = function runInOne(callback) {
        return this.consume(callback);
    };

    /**
     * @param action
     * @param data
     */


    Messenger.prototype.consume = function consume(action, data) {
        var _this3 = this;

        if (helper.isFunction(action)) {
            var callback = action;
            count = count % Number.MAX_SAFE_INTEGER + 1;
            var taskId = count + '' + process.pid;
            action = 'jinghuan-messenger-' + taskId;
            this.once(action, callback);

            helper.timeout(10000).then(function () {
                return _this3.removeAllListeners(action);
            });
        } else {
            assert(this.listenerCount(action) > 0, 'can not find `' + action + '` listeners');
        }
        process.send({
            act: MESSENGER,
            action: action,
            data: data,
            target: 'one'
        });
    };

    return Messenger;
}(events);

module.exports = Messenger;