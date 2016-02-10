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
