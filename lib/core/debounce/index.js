"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 */
var Debounce = function () {
  function Debounce() {
    _classCallCheck(this, Debounce);

    this.queues = {};
  }
  /**
   * debounce
   * @param {String} key
   * @param {Function} fn
   */


  Debounce.prototype.debounce = function debounce(key, fn) {
    var _this = this;

    if (!(key in this.queues)) {
      this.queues[key] = [];
      return Promise.resolve(fn()).then(function (data) {
        process.nextTick(function () {
          _this.queues[key].forEach(function (deferred) {
            return deferred.resolve(data);
          });
          delete _this.queues[key];
        });
        return data;
      }).catch(function (err) {
        process.nextTick(function () {
          _this.queues[key].forEach(function (deferred) {
            return deferred.reject(err);
          });
          delete _this.queues[key];
        });
        return Promise.reject(err);
      });
    } else {
      return new Promise(function (resolve, reject) {
        _this.queues[key].push({
          resolve: resolve,
          reject: reject
        });
      });
    }
  };

  return Debounce;
}();

module.exports = Debounce;