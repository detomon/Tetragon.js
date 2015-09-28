(function () {
'use strict';

var Entity = Tetragon.Entity = function (id, system) {
	this.id = id;
	this.system = system;
};

Entity.prototype.addComponent = function (component, params) {
	if (component.data[this.id]) {
		return null;
	}

	var instance = components.createInstance(params);
	instance.entity = this;
	component.data[this.id] = instance;
	this.system.entities[this.id] |= (1 << component.id);

	return instance;
};

Entity.prototype.componentData = function (name) {
	var component = this.system.namedComponents[name];

	if (!component) {
		return null;
	}

	return component.data[this.id];
};

Entity.prototype.delete = function () {
	var n = 0;
	var system = this.system;

	if (system.entities[entity.id] === undefined) {
		return;
	}

	var mask = system.entities[this.id];

	while (mask) {
		if (!(mask & 0xFF)) {
			mask >>= 8;
			n += 8;
		}

		if (mask & 1) {
			var component = system.components[n];
			component.data[entity.id] = undefined;

			mask >>= 1;
			n ++;
		}
	}

	system.entities[entity.id] = undefined;
	system.freeEntites.push(entity.id);
};

var EntityComponent = Tetragon.EntityComponent = function (id, options) {
	this.id = id;
	this.name = options.name;
	this.createInstance = options.createInstance;
	this.process = options.process;
	this.data = [];
};

var EntitySystem = Tetragon.EntitySystem = function () {
	this.entities = [];
	this.freeEntites = [];
	this.components = [];
	this.namedComponents = {};
};

EntitySystem.prototype.getComponent = function (name) {
	return this.namedComponents[name];
};

EntitySystem.prototype.createComponent = function (options) {
	var id = this.component.length;
	var component = new EntityComponent(id, options);
	this.components.push(component);
	this.namedComponents[component.name] = component;

	return component;
};

EntitySystem.prototype.getEntity = function (id) {
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

}());
