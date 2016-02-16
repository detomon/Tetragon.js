/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

T.extend = function (obj, obj2) {
	var i, j;
	var arg;
	var args = Array.prototype.slice.call(arguments, 1);

	obj = obj || {};

	for (i = 0; i < args.length; i ++) {
		var arg = args[i] || {};

		for (j in arg) {
			if (arg.hasOwnProperty(j)) {
				if (arg[j] !== null && arg[j] !== undefined) {
					obj[j] = arg[j];
				}
			}
		}
	}

	return obj;
};

T.loadImages = function (images, options) {
	var i;
	var keys;
	var options    = options || {};
	var loadCount  = 0;
	var errorCount = 0;
	var loadedImgs = {};

	function handleDone() {
		if (errorCount) {
			if (options.error) {
				options.error(loadedImgs);
			}
		}
		else if (options.done) {
			options.done(loadedImgs);
		}
	}

	function waitForLoad(src, key) {
		var image = new Image();

		image.onload = function () {
			if (!loadedImgs[key]) {
				loadedImgs[key] = image;

				if (options.load) {
					options.load(key, image);
				}

				if (++ loadCount >= keys.length) {
					handleDone();
				}
			}
		};

		image.onerror = function () {
			errorCount ++;

			if (!loadedImgs[key]) {
				loadedImgs[key] = undefined;

				if (options.fail) {
					options.fail(key, src);
				}

				if (++ loadCount >= keys.length) {
					handleDone();
				}
			}
		};

		image.src = src;

		return image;
	}

	options = T.extend({
		done: null,
		error: null,
		load: null,
		fail: null,
	}, options);

	keys = Object.keys(images);

	if (keys.length == 0) {
		if (options.done) {
			options.done(loadedImgs);
		}
	}

	for (i = 0; i < keys.length; i ++) {
		var key = keys[i];
		var src = images[key];

		// assuming an image element
		if (src === Object(src)) {
			src = src.src;
		}

		waitForLoad(src, key);
	}
};

}(Tetragon));
