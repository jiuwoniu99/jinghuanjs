"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
let Debounce = class Debounce {
    constructor() {
        this.queues = {};
    }

    debounce(key, fn) {
        if (!(key in this.queues)) {
            this.queues[key] = [];
            return Promise.resolve(fn()).then(data => {
                process.nextTick(() => {
                    this.queues[key].forEach(deferred => deferred.resolve(data));
                    delete this.queues[key];
                });
                return data;
            }).catch(err => {
                process.nextTick(() => {
                    this.queues[key].forEach(deferred => deferred.reject(err));
                    delete this.queues[key];
                });
                return Promise.reject(err);
            });
        } else {
            return new Promise((resolve, reject) => {
                this.queues[key].push({
                    resolve,
                    reject
                });
            });
        }
    }
};
exports.default = Debounce;