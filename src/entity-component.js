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
 * first argument and all argument given to this function.
 * If `func` is a string, the corresponding callback of the compoennt given at
 * initialization is called with the entity component data as first argument
 * and all argument given to this function.
 */
proto.iterate = function (func) {
	var i;
	var args = Array.prototype.slice.call(arguments, 1);

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

}(Tetragon));
