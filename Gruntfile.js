/*!***************************************************
 * jmHighlight
 * Copyright (c) 2014–2016, Julian Motz
 * For the full copyright and license information, 
 * please view the LICENSE file that was distributed 
 * with this source code.
 *****************************************************/
module.exports = function(grunt){
	var fc = grunt.file.read('src/jquery.jmHighlight.js');
	var regex = /(\/\*\![^]*Copyright[^/]*\/)/gmi;
	var banner = fc.match(regex)[0];
	/**
	 * Configuration
	 */
	grunt.initConfig({
		banner: banner,
		karma: {
			options: {
				configFile: 'karma.conf.js' // shared config
			},
			prod: {},
			dev: {
				autoWatch: true,
				singleRun: false,
				browsers: [], // open your prefered browser manually
			},
			saucelabs: {
				configFile: 'karma.conf-ci.js'
			}
		},
		uglify: {
			dist: {
				options: {
					compress: true,
					preserveComments: false,
					banner: '<%= banner %>\r\n'
				},
				files: {
					'dist/jquery.jmHighlight.min.js': 'src/jquery.jmHighlight.js'
				}
			}
		}
	});
	/**
	 * Load Grunt plugins (dynamically)
	 */
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	/**
	 * Register tasks
	 */
	grunt.log.writeln(banner['yellow']);
	grunt.registerTask('dev', ['karma:dev']);
	grunt.registerTask('test', ['karma:prod']);
	grunt.registerTask('test-saucelabs', function(){
		if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
			grunt.log.error(
				'Make sure SAUCE_USERNAME and SAUCE_ACCESS_KEY ' +
				'environment variables are set.'
			);
			return;
		}
		grunt.task.run(['karma:saucelabs']);
	});
	grunt.registerTask('minify', ['uglify:dist']);
	grunt.registerTask('dist', ['test', 'minify']);
};


