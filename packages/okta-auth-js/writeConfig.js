/* globals __dirname */
/* eslint-disable no-console */
/*
 * This builds a config file that is imported by each module
 * that needs access to a global variable like SDK_VERSION.
 * The DefinePlugin in webpack is insufficient, because it
 * restricts the sdk to only being used in a webpack config.
 */

var packageJson = require('./package.json');
var fs = require('fs');

var oktaAuthConfig = packageJson['okta-auth-js'];
oktaAuthConfig.SDK_VERSION = packageJson.version;

var configDest = __dirname + '/lib/config.js';

console.log('Writing config to', configDest);
fs.writeFileSync(configDest, 'module.exports = ' + JSON.stringify(oktaAuthConfig, null, 2) + ';');
