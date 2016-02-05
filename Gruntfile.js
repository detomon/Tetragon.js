module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			build: {
				src: [
					'dist/tetragon.js'
				],
				dest: 'dist/tetragon.min.js',
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true
				}
			}
		},

		concat_in_order: {
			build: {
				files: {
					'dist/tetragon.js': ['src/*.js']
				},
				options: {
					extractRequired: function(filepath, filecontent) {
						var path = require('path');
						var workingdir = path.normalize(filepath).split(path.sep);
						workingdir.pop();

						var deps = this.getMatches(/\*\s*@depend\s(.*\.js)/g, filecontent);
						deps.forEach(function(dep, i) {
							var dependency = workingdir.concat([dep]);
							deps[i] = path.join.apply(null, dependency);
						});
						return deps;
					},
					extractDeclared: function(filepath) {
						return [filepath];
					},
					onlyConcatRequiredFiles: false
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-concat-in-order');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [
		'concat_in_order',
		'uglify',
	]);

};
