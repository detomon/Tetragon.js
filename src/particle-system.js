/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var ParticleSystem = T.ParticleSystem = function (options) {
	options = T.extend({
		construct: function () {},
	}, options);

	this.options = options;
	this.particles = [];
};

var proto = ParticleSystem.prototype;

proto.add = function () {
	var object = {};

	this.options.construct.apply(object, arguments);
	this.particles.push(object);

	return object;
};

proto.iterate = function (func) {
	var i;
	var args = Array.prototype.slice.call(arguments, 1);
	var particles = this.particles;

	if (typeof func == 'string') {
		func = this.options[func];
	}

	function deleteParticle() {
		if (particles[i] !== undefined) {
			particles[i] = particles[particles.length - 1];
			particles.length --;
			i --;
		}
	}

	var info = {
		id: 0,
		delete: deleteParticle,
	};

	args.unshift(info);

	for (i = 0; i < particles.length; i ++) {
		info.id = i;
		func.apply(particles[i], args);
	}
};

proto.clear = function () {
	this.particles.length = 0;
};

}(Tetragon));
