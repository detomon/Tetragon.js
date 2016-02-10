module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			build: {
				files: {
					'tetragon.min.js': 'tetragon.js',
					'tetragon.base.min.js': 'tetragon.base.js',
					'tetragon.entity.min.js': 'tetragon.entity.js',
					'tetragon.animation.min.js': 'tetragon.animation.js',
					'tetragon.physics.min.js': 'tetragon.physics.js',
				},
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true,
				},
			},
		},

		concat_in_order: {
			build: {
				files: {
					'tetragon.js': [
						'src/*.js',
					],
					'tetragon.base.js': [
						'src/tetragon.js',
						'src/functions.js',
						'src/request-animation-frame.polyfill.js',
						'src/canvas.js',
						'src/animation-loop.js',
						'src/vector.js',
						'src/matrix.js',
						'src/range.js',
						'src/rect.js',
					],
					'tetragon.entity.js': [
						'src/tetragon.js',
						'src/entity*.js',
					],
					'tetragon.animation.js': [
						'src/tetragon.js',
						'src/tween.js',
					],
					'tetragon.physics.js': [
						'src/tetragon.js',
						'src/point-mass.js',
						'src/constraint.js',
					],
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
					onlyConcatRequiredFiles: false,
				},
			},
		},

	});

	grunt.loadNpmTasks('grunt-concat-in-order');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [
		'concat_in_order',
		'uglify',
	]);

};
