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
		sl_chrome: {
			base: 'SauceLabs',
			browserName: 'chrome',
			platform: 'Windows 7',
			version: '35'
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
		logLevel: config.LOG_DEBUG,
		autoWatch: false,
		plugins : [
			'karma-jasmine',
			'karma-jasmine-jquery',
			'karma-phantomjs-launcher',
			'karma-spec-reporter',
			'karma-sauce-launcher'
		],
		sauceLabs: {
			testName: 'jmHighlight Unit Tests',
			recordScreenshots: false
		},
		customLaunchers: customLaunchers,
		browsers: Object.keys(customLaunchers),
		reporters: ['spec', 'saucelabs'],
		captureTimeout: 120000, // in case connection in CI is slow
		singleRun: true
	});
};