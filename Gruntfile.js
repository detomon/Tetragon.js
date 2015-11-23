module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

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
		},

		concat_in_order: {
			build: {
				files: {
					'tetragon.js': ['src/*.js']
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

	grunt.registerTask('build', [
		'concat_in_order',
		'uglify',
	]);

};
