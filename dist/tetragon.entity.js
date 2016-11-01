(function (w) {
'use strict';

w.Tetragon = w.Tetragon || {
	version: '0.1.13',
};

}(window));

/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var EntityComponent = T.EntityComponent = function (id, options) {
	this.id = id;
	this.name = options.name;
	this.options = options;
	this.construct = options.construct;
	this.destruct = options.destruct;
	this.data = [];
};

var proto = EntityComponent.prototype;

/**
 * Iterate entity component data
 *
 * If `func` is a callback, it will be called with the entity component data as
 * first argument followed by all arguments given to this function.
 * If `func` is a string, the corresponding callback of the component is used.
 */
proto.iterate = function (func) {
	var i;
	var args = Array.prototype.slice.call(arguments, 1);

	if (typeof func == 'string') {
		func = this.options[func];
	}

	for (i in this.data) {
		if (this.data.hasOwnProperty(i)) {
			func.apply(this.data[i], args);
		}
	}
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend entity-component.js
 */

(function (T) {
'use strict';

var EntitySystem = T.EntitySystem = function () {
	this.entities = [];
	this.freeEntites = [];
	this.components = [];
	this.namedComponents = {};
};

var proto = EntitySystem.prototype;

proto.component = function (name) {
	return this.namedComponents[name];
};

proto.createComponent = function (options) {
	options = T.extend({
		construct: null,
		destruct: null,
	}, options);

	var id = this.components.length;
	var component = new T.EntityComponent(id, options);
	this.components.push(component);
	this.namedComponents[component.name] = component;

	return component;
};

proto.entity = function (id) {
	if (this.entities[id] === undefined) {
		return null;
	}

	return new T.Entity(id, this);
};

proto.createEntity = function () {
	var id = this.freeEntites.pop();

	if (id === undefined) {
		id = this.entities.length + 1;
		this.entities.push(0);
	}

	return new T.Entity(id, this);
};

proto.iterate = function (name, func) {
	var args = Array.prototype.slice.call(arguments, 2);
	var component = this.component(name);

	if (component) {
		args.unshift(func);
		component.iterate.apply(component, args);
	}
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend entity-system.js
 * @depend entity-component.js
 */

(function (T) {
'use strict';

var Entity = T.Entity = function (id, system) {
	this.id = id;
	this.system = system;
};

var proto = Entity.prototype;

proto.addComponent = function (component) {
	var args = Array.prototype.slice.call(arguments, 1);

	if (typeof component == 'string') {
		component = this.system.component(component);

		if (!component) {
			return null;
		}
	}

	if (component.data[this.id - 1]) {
		return null;
	}

	var instance = {
		entity: this,
	};

	if (component.construct) {
		component.construct.apply(instance, args);
	}

	component.data[this.id - 1] = instance;
	this.system.entities[this.id - 1] |= (1 << component.id);

	return instance;
};

proto.removeComponent = function (component) {
	if (typeof component == 'string') {
		component = this.system.component(component);

		if (!component) {
			return null;
		}
	}

	if (!component.data[this.id - 1]) {
		return null;
	}

	if (component.destruct) {
		component.destruct.apply(component.data[this.id - 1]);
	}

	delete component.data[this.id - 1];
	this.system.entities[this.id - 1] &= ~(1 << component.id);
};

proto.componentData = function (name) {
	var component = this.system.namedComponents[name];

	if (!component) {
		return null;
	}

	return component.data[this.id - 1];
};

proto.delete = function () {
	var n = 0;
	var system = this.system;

	if (system.entities[this.id - 1] === undefined) {
		return;
	}

	var mask = system.entities[this.id - 1];

	while (mask) {
		if (!(mask & 0xFF)) {
			mask >>= 8;
			n += 8;
		}

		if (mask & 1) {
			var component = system.components[n];

			if (component.destruct) {
				component.destruct.apply(component.data[this.id - 1]);
			}

			delete component.data[this.id - 1];
		}

		mask >>= 1;
		n ++;
	}

	delete system.entities[this.id - 1];
	system.freeEntites.push(this.id);
};

}(Tetragon));

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
