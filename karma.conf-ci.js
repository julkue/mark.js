/*!***************************************************
 * jmHighlight
 * Copyright (c) 2014-2016, Julian Motz
 * For the full copyright and license information, 
 * please view the LICENSE file that was distributed 
 * with this source code.
 *****************************************************/
module.exports = function(config) {
	// Define Sauce Labs browsers
	var customLaunchers = {
		'SL_Win_Chrome_30': {
			base: 'SauceLabs',
			browserName: 'chrome',
			platform: 'Windows 10',
			version: '30'
		},
		'SL_Win_Chrome_48': {
			base: 'SauceLabs',
			browserName: 'chrome',
			platform: 'Windows 10',
			version: '48'
		},
		'SL_Win_Chrome_Beta': {
			base: 'SauceLabs',
			browserName: 'chrome',
			platform: 'Windows 10',
			version: 'beta'
		},
		'SL_Win_Firefox_30': {
			base: 'SauceLabs',
			browserName: 'firefox',
			platform: 'Windows 10',
			version: '30'
		},
		'SL_Win_Firefox_44': {
			base: 'SauceLabs',
			browserName: 'firefox',
			platform: 'Windows 10',
			version: '44'
		},
		'SL_Win_Firefox_Beta': {
			base: 'SauceLabs',
			browserName: 'firefox',
			platform: 'Windows 10',
			version: 'beta'
		},
		'SL_Win_Opera_12': {
			base: 'SauceLabs',
			browserName: 'opera',
			platform: 'Windows 7',
			version: '12.12'
		},
		'SL_OSX_Safari_6': {
			base: 'SauceLabs',
			browserName: 'safari',
			platform: 'OS X 10.8',
			version: '6'
		},
		'SL_OSX_Safari_9': {
			base: 'SauceLabs',
			browserName: 'safari',
			platform: 'OS X 10.11',
			version: '9'
		},
		'SL_Win_IE_9': {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			platform: 'Windows 7',
			version: '9'
		},
		'SL_Win_IE_10': {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			platform: 'Windows 7',
			version: '10'
		},
		'SL_Win_IE_11': {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			platform: 'Windows 7',
			version: '11'
		},
		'SL_Win_Edge_20': {
			base: 'SauceLabs',
			browserName: 'microsoftedge',
			platform: 'Windows 10',
			version: '20'
		},
		'SL_iOS_9': {
			base: 'SauceLabs',
			browserName: 'iphone',
			platform: 'OS X 10.10',
			version: '9.2'
		},
		'SL_iOS_8': {
			base: 'SauceLabs',
			browserName: 'iphone',
			platform: 'OS X 10.10',
			version: '8.0'
		},
		'SL_Android_4': {
			base: 'SauceLabs',
			browserName: 'android',
			platform: 'Linux',
			version: '4.4'
		}
	};
	config.set({
		basePath: '',
		frameworks: ['jasmine-jquery', 'jasmine'],
		files: [
			'vendor/jquery/dist/jquery.min.js',
			'src/*.js',
			{
				pattern: 'test/fixtures/*.html',
				included: false,
				served: true
			}
		],
		exclude: [],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		plugins : [
			'karma-jasmine',
			'karma-jasmine-jquery',
			'karma-phantomjs-launcher',
			'karma-spec-reporter',
			'karma-sauce-launcher'
		],
		sauceLabs: {
			testName: 'jmHighlight Unit Tests'
		},
		customLaunchers: customLaunchers,
		browsers: Object.keys(customLaunchers),
		reporters: ['spec', 'saucelabs'],
		captureTimeout: 120000, // in case connection in CI is slow
		singleRun: true
	});
};