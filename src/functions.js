/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

T.extend = function (obj, obj2) {
	var i, j;
	var arg;
	var args = Array.prototype.slice.call(arguments, 1);

	for (i = 0; i < args.length; i ++) {
		var arg = args[i];

		for (j in arg) {
			if (arg.hasOwnProperty(j)) {
				if (arg[j] !== null && arg[j] !== undefined) {
					obj[j] = arg[j];
				}
			}
		}
	}

	return obj;
}

}(Tetragon));
