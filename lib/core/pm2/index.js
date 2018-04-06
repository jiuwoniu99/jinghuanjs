'use strict';

var env = process.env;
var pm2KeyList = ['PM2_USAGE', 'PM2_SILENT', 'PM2_INTERACTOR_PROCESSING', 'PM2_HOME', 'PM2_JSON_PROCESSING'];
var inPM2 = pm2KeyList.some(function (item) {
	return !!env[item];
});
var clusterMode = env.exec_mode === 'cluster_mode';

exports.inPM2 = inPM2;
exports.isClusterMode = clusterMode;