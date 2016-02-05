/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var EntityComponent = T.EntityComponent = function (id, options) {
	this.id = id;
	this.name = options.name;
	this.options = options;
	this.createInstance = options.createInstance;
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
