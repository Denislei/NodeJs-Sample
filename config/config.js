const lodash = require('lodash');
//require('./logger-file.js');

// module variables
console.log('Loading.....');
const config = require('./config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = lodash.merge(defaultConfig, environmentConfig);

console.log('Project Configuration: ' + JSON.stringify(finalConfig));

if ( finalConfig.disableDebug ) {
	console.debug = function () {};
}

// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;
