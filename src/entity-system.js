/**
 * @depend tetragon.js
 */

(function () {
'use strict';

var EntitySystem = Tetragon.EntitySystem = function () {
	this.entities = [];
	this.freeEntites = [];
	this.components = [];
	this.namedComponents = {};
};

EntitySystem.prototype.component = function (name) {
	return this.namedComponents[name];
};

EntitySystem.prototype.createComponent = function (options) {
	var id = this.components.length;
	var component = new EntityComponent(id, options);
	this.components.push(component);
	this.namedComponents[component.name] = component;

	return component;
};

EntitySystem.prototype.entity = function (id) {
	if (this.entities[id] === undefined) {
		return null;
	}

	return new Entity(id, this);
};

EntitySystem.prototype.createEntity = function () {
	var id = this.freeEntites.pop();

	if (id === undefined) {
		id = this.entities.length + 1;
		this.entities.push(0);
	}

	return new Entity(id, this);
};

EntitySystem.prototype.iterate = function (name, func) {
	var args = Array.prototype.slice.apply(arguments, [2]);
	var component = this.component(name);

	if (component) {
		args.unshift(func);
		component.iterate.apply(component, args);
	}
};

var Entity = Tetragon.Entity = function (id, system) {
	this.id = id;
	this.system = system;
};

Entity.prototype.addComponent = function (component) {
	var args = Array.prototype.slice.apply(arguments, [1]);

	if (typeof(component) == 'string') {
		component = this.system.component(component);

		if (!component) {
			return null;
		}
	}

	if (component.data[this.id - 1]) {
		return null;
	}

	var instance;

	if (component.createInstance) {
		instance = component.createInstance.apply(this, args);
	}
	else {
		instance = {};
	}

	instance.entity = this;
	component.data[this.id - 1] = instance;
	this.system.entities[this.id - 1] |= (1 << component.id);

	return instance;
};

Entity.prototype.removeComponent = function (component) {
	if (typeof(component) == 'string') {
		component = this.system.component(component);

		if (!component) {
			return null;
		}
	}

	if (!component.data[this.id - 1]) {
		return null;
	}

	delete component.data[this.id - 1];
	this.system.entities[this.id - 1] &= ~(1 << component.id);

	return instance;
};

Entity.prototype.componentData = function (name) {
	var component = this.system.namedComponents[name];

	if (!component) {
		return null;
	}

	return component.data[this.id - 1];
};

Entity.prototype.delete = function () {
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
			delete component.data[this.id - 1];
		}

		mask >>= 1;
		n ++;
	}

	delete system.entities[this.id - 1];
	system.freeEntites.push(this.id);
};

var EntityComponent = Tetragon.EntityComponent = function (id, options) {
	this.id = id;
	this.name = options.name;
	this.options = options;
	this.createInstance = options.createInstance;
	this.data = [];
};

/**
 * Iterate entity component data
 *
 * If `func` is a callback, it will be called with the entity component data as
 * first argument and all argument given to this function.
 * If `func` is a string, the corresponding callback of the compoennt given at
 * initialization is called with the entity component data as first argument
 * and all argument given to this function.
 */
EntityComponent.prototype.iterate = function (func) {
	var i;
	var args = Array.prototype.slice.apply(arguments, [1]);

	if (typeof(func) === "function") {
		for (i in this.data) {
			if (this.data.hasOwnProperty(i)) {
				func.apply(this.data[i], args);
			}
		}
	}
	else {
		func = this.options[func];

		if (!func) {
			return;
		}

		for (i in this.data) {
			if (this.data.hasOwnProperty(i)) {
				//args[0] = this.data[i];
				func.apply(this.data[i], args);
			}
		}
	}
};

}());
