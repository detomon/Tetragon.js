module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			build: {
				files: {
					'dist/tetragon.min.js': 'dist/tetragon.js',
					'dist/tetragon.base.min.js': 'dist/tetragon.base.js',
					'dist/tetragon.entity.min.js': 'dist/tetragon.entity.js',
					'dist/tetragon.animation.min.js': 'dist/tetragon.animation.js',
					'dist/tetragon.physics.min.js': 'dist/tetragon.physics.js',
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
					'dist/tetragon.js': [
						'src/*.js',
					],
					'dist/tetragon.base.js': [
						'src/tetragon.js',
						'src/functions.js',
						'src/canvas.js',
						'src/animation-loop.js',
						'src/vector.js',
						'src/matrix.js',
						'src/range.js',
						'src/rect.js',
						'src/quadtree.js',
					],
					'dist/tetragon.entity.js': [
						'src/tetragon.js',
						'src/entity*.js',
						'src/particle*.js',
					],
					'dist/tetragon.animation.js': [
						'src/tetragon.js',
						'src/tween.js',
						'src/image-upscaler.js',
					],
					'dist/tetragon.physics.js': [
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
