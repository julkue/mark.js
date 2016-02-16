/*!***************************************************
 * jmHighlight
 * Copyright (c) 2014–2016, Julian Motz
 * For the full copyright and license information, 
 * please view the LICENSE file that was distributed 
 * with this source code.
 *****************************************************/
module.exports = function(grunt){
	// Determine dist header
	var fc = grunt.file.read('src/jquery.jmHighlight.js');
	var regex = /(\/\*\![^]*Copyright[^/]*\/)/gmi;
	var banner = fc.match(regex)[0];
	/**
	 * Configuration
	 */
	grunt.initConfig({
		banner: banner,
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			},
			dev: {
				configFile: 'karma.conf.js',
				autoWatch: true,
				singleRun: false,
				browsers: [], // open your prefered browser manually
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
	grunt.registerTask('dev', function(){
		grunt.task.run(['karma:dev']);
	});
	grunt.registerTask('test', function(){
		grunt.task.run(['karma:unit']);
	});
	grunt.registerTask('minify', function(){
		grunt.task.run(['uglify:dist']);
	});
	grunt.registerTask('dist', function(){
		grunt.task.run(['test', 'minify']);
	});
};
