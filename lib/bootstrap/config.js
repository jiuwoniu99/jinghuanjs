"use strict";

module.exports = {
    onUnhandledRejection: err => jinghuan.logger.error(err),
    onUncaughtException: err => jinghuan.logger.error(err) };