module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			build: {
				src: [
					'src/*.js'
				],
				dest: 'tetragon.js',
			}
		},

		uglify: {
			build: {
				src: [
					'tetragon.js'
				],
				dest: 'tetragon.min.js',
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('build', [
		'concat',
		'uglify',
	]);

};
