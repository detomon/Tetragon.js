(function (w) {
'use strict';

w.Tetragon = w.Tetragon || {
	version: '0.1.0',
};

}(window));

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
};

T.reduce = function (items, initValue, reduce) {
	var i;
	var value = initValue;

	for (i = 0; i < items.length; i ++) {
		value = reduce(value, items[i]);
	}

	return value;
};

T.loadImages = function (images, options) {
	var i;
	var keys;
	var options    = options || {};
	var loadCount  = 0;
	var loadedImgs = {};

	function waitForLoad(src, key) {
		var image = new Image();

		image.onload = function () {
			if (!loadedImgs[key]) {
				loadedImgs[key] = image;

				if (options.load) {
					options.load(image);
				}

				if (++ loadCount >= keys.length) {
					if (options.done) {
						options.done(loadedImgs);
					}
				}
			}
		};

		image.src = src;

		return image;
	}

	options = T.extend({
		done: null,
		load: null
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

/**
 * Polyfill for window.requestAnimationFrame
 *
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
(function (w) {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for(var x = 0; x < vendors.length && !w.requestAnimationFrame; ++x) {
		w.requestAnimationFrame = w[vendors[x]+'RequestAnimationFrame'];
		w.cancelAnimationFrame =
		  w[vendors[x]+'CancelAnimationFrame'] || w[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!w.requestAnimationFrame)
		w.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = w.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!w.cancelAnimationFrame)
		w.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
}(window));

/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

/**
 * Animation loop
 */
var AnimationLoop = T.AnimationLoop = function (framerate) {
	this.framerate = framerate;
	this.lastTime  = 0;
}

var proto = AnimationLoop.prototype;

/**
 * Advance animation loop to new time
 *
 * `tickFunc` is called every frame
 */
proto.advanceToTime = function (time, tickFunc) {
	// set `lastTime` to previous frame if first frame
	if (this.lastTime == 0) {
		this.lastTime = time - 1.0 / 60.0;
	}

	// limit previous time if animation was paused or had a greater lag,
	// the loop will not try to catch up with a too big time step
	this.lastTime = Math.max(time - 1.0 / 20.0, this.lastTime)

	// only advance to previous frame
	time -= this.framerate;

	// advance to new time
	while (this.lastTime < time) {
		tickFunc(this.framerate);
		this.lastTime += this.framerate;
	}
};

}(Tetragon));

/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var Vector = T.Vector = function (x, y) {
	this.x = parseFloat(x) || 0.0;
	this.y = parseFloat(y) || 0.0;
};

var proto = Vector.prototype;

proto.add = function (vec) {
	return new Vector(this.x + vec.x, this.y + vec.y);
};

proto.sub = function (vec) {
	return new Vector(this.x - vec.x, this.y - vec.y);
};

proto.inc = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
};

proto.dec = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
};

proto.shl = function (n) {
	return new Vector(
		this.x << n,
		this.y << n
	);
};

proto.shr = function (n) {
	return new Vector(
		this.x >> n,
		this.y >> n
	);
};

proto.integ = function (n) {
	return new Vector(
		this.x | 0,
		this.y | 0
	);
};

proto.mult = function (fac) {
	return new Vector(this.x * fac, this.y * fac);
};

proto.div = function (fac) {
	return new Vector(this.x / fac, this.y / fac);
};

proto.length = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

proto.lengthSquared = function () {
	return this.x * this.x + this.y * this.y;
};

proto.normalize = function (length) {
	if (length === undefined) {
		length = 1.0;
	}

	var x   = this.x;
	var y   = this.y;
	var len = this.length();

	if (len) {
		len = length / len;
	}

	x *= len;
	y *= len;

	return new Vector(x, y);
};

proto.multVec = function (vec) {
	return new Vector(this.x * vec.x, this.y * vec.y);
};

proto.divVec = function (vec) {
	return new Vector(this.x / vec.x, this.y / vec.y);
};

proto.dot = function (vec) {
	return this.x * vec.x + this.y * vec.y;
};

proto.reflect = function (wall) {
	wall = wall.normalize();
	return this.sub(wall.mult(2.0 * wall.dot(this)));
};

proto.negate = function (wall) {
	return new Vector(-this.x, -this.y);
};

proto.copy = function () {
	return new Vector(this.x, this.y);
};

proto.rotate = function (a) {
	var r = a / 180.0 * Math.PI;
	var c = Math.cos(r);
	var s = Math.sin(r);

	var x = this.x * c - this.y * s;
	var y = this.x * s + this.y * c;

	return new Vector(x, y);
};

proto.copy = function (a) {
	return new Vector(this.x, this.y);
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

var Matrix = T.Matrix = function (values) {
	if (values) {
		this.set(values);
	}
	else {
		this.set([
			1, 0,
			0, 1,
			0, 0,
		]);
	}
};

var proto = Matrix.prototype;

proto.translate = function (vec) {
	this[4] += vec.x * this[0] + vec.y * this[2];
	this[5] += vec.x * this[1] + vec.y * this[3];

	return this;
};

proto.scale = function (vec) {
	this[0] *= vec.x;
	this[2] *= vec.x;
	this[1] *= vec.y;
	this[3] *= vec.y;

	return this;
};

proto.rotate = function (a) {
	var s, c;

	a = a / 180.0 * Math.PI;
	s = Math.sin(a);
	c = Math.cos(a);

	var m = this.multiply(new T.Matrix([
		c, s,
		-s, c,
		0, 0,
	]));

	this.set(m);

	return this;
};

proto.multVec = function (vec) {
	return new T.Vector(
		this[0] * vec.x + this[2] * vec.y + this[4],
		this[1] * vec.x + this[3] * vec.y + this[5]
	);
};

proto.multiply = function (mat) {
	return new Matrix([
		this[0] * mat[0] + this[2] * mat[1],
		this[1] * mat[0] + this[3] * mat[1],
		this[0] * mat[2] + this[2] * mat[3],
		this[1] * mat[2] + this[3] * mat[3],
		this[0] * mat[4] + this[2] * mat[5] + this[4],
		this[1] * mat[4] + this[3] * mat[5] + this[5]
	]);
};

proto.invert = function () {
	var det;
	var mat = new T.Matrix();

	mat[0] =  this[3];
	mat[1] = -this[1];
	mat[2] = -this[2];
	mat[3] =  this[0];
	mat[4] =  this[2] * this[5] - this[3] * this[4];
	mat[5] = -this[0] * this[5] + this[1] * this[4];

	det = this[0] * mat[0] + this[2] * mat[1];

	if (det == 0.0) {
		return this.copy();
	}

	det = 1.0 / det;

	mat[0] *= det;
	mat[1] *= det;
	mat[2] *= det;
	mat[3] *= det;
	mat[4] *= det;
	mat[5] *= det;

	return mat;
};

proto.copy = function () {
	return new T.Matrix(this);
};

proto.set = function (mat) {
	this[0] = mat[0];
	this[1] = mat[1];
	this[2] = mat[2];
	this[3] = mat[3];
	this[4] = mat[4];
	this[5] = mat[5];

	return this;
};

proto.setContextTransform = function (ctx) {
	ctx.setTransform(this[0], this[1], this[2], this[3], this[4], this[5]);
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

var Range = T.Range = function (start, length) {
	this.start = start || 0;
	this.length = length || 0;

};

var proto = Range.prototype;

Object.defineProperty(proto, 'end', {
	enumerable: true,
	get: function () {
		return this.start + this.length;
	},
	set: function (end) {
		this.length = end - this.start;
	}
});

proto.containsPoint = function (point) {
	return point >= this.start && point < this.end;
};

proto.containsRange = function (range) {
	return range.start >= this.start && range.end <= this.end;
};

proto.intersectsWithRange = function (range) {
	return range.start < this.end && range.end > this.start;
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

var Rect = T.Rect = function (p, s) {
	this.pos  = p ? p.copy() : new T.Vector();
	this.size = s ? s.copy() : new T.Vector();
};

var proto = Rect.prototype;

Object.defineProperty(proto, 'maxPos', {
	enumerable: true,
	get: function () {
		return this.pos.add(this.size);
	},
	set: function (maxPos) {
		this.size = maxPos.sub(this.size);
	}
});

Object.defineProperty(proto, 'center', {
	enumerable: true,
	get: function () {
		return this.pos.add(this.size.mult(0.5));
	},
	set: function (center) {
		this.pos = center.sub(this.size.mult(0.5));
	}
});

proto.containsPoint = function (point) {
	var pos = this.pos;
	var maxPos = this.maxPos;

	if (point.x >= pos.x && point.x < maxPos.x) {
		if (point.y >= pos.y && point.y < maxPos.y) {
			return true;
		}
	}

	return false;
};

proto.containsRect = function (rect) {
	var pos = this.pos;
	var maxPos = this.maxPos;
	var rectPos = rect.pos;
	var rectMaxPos = rect.maxPos;

	if (rectPos.x >= pos.x && rectMaxPos.x < maxPos.x) {
		if (rectPos.y >= pos.y && rectMaxPos.y < maxPos.y) {
			return true;
		}
	}

	return false;
};

proto.intersectsWithRect = function (rect) {
	var pos = this.pos;
	var maxPos = this.maxPos;
	var rectPos = rect.pos;
	var rectMaxPos = rect.maxPos;

	if (rectMaxPos.x > pos.x && rectPos.x < maxPos.x) {
		if (rectMaxPos.y > pos.y && rectPos.y < maxPos.y) {
			return true;
		}
	}

	return false;
};

proto.copy = function () {
	return new Rect(this.pos.copy(), this.size.copy());
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend animation-loop.js
 * @depend vector.js
 * @depend matrix.js
 */

(function (T) {
'use strict';

var TRANSFORM_UPDATED = 1 << 0;
var AUTO_CLEAR        = 1 << 1;

/**
 * Encapsulates canvas animation
 */
var Canvas = T.Canvas = function (options) {
	options = T.extend({
		element: null,
		tick: function () {},
		draw: function () {},
		framerate: 1.0 / 120.0,
		autoClear: true,
		origin: new T.Vector(0.5, 0.5),
		scale: null,
		autoSetHeight: /MSIE/.test(navigator.userAgent), // IE 10 and below
	}, options);

	this.element       = options.element;
	this.ctx           = options.element.getContext('2d');
	this.tick          = options.tick;
	this.draw          = options.draw;
	this.framerate     = options.framerate;
	this.animationLoop = new T.AnimationLoop(this.framerate);
	this._viewport     = new T.Rect();
	this._transform    = null;
	this._inverseTrans = null;
	this._flags        = 0;
	this.options       = options;

	if (options.autoClear) {
		this._flags |= AUTO_CLEAR;
	}
};

var proto = Canvas.prototype;

Object.defineProperty(proto, 'viewport', {
	get: function () {
		var element = this.element;
		var width   = +element.width;
		var height  = +element.height;

		this._viewport.size.x = width;
		this._viewport.size.y = height;

		return this._viewport;
	}
});

Object.defineProperty(proto, 'transform', {
	get: function () {
		var transform = this._transform;

		if (!transform) {
			transform = new T.Matrix();

			if (this.options.origin) {
				transform.translate(this.options.origin.multVec(this.viewport.size));
			}

			if (this.options.scale) {
				transform.scale(this.options.scale);
			}
		}

		return transform;
	},
	set: function (transform) {
		if (transform) {
			transform = transform.copy()
		}

		this._transform = transform;
		this._transform.setContextTransform(this.ctx);
		this._flags |= TRANSFORM_UPDATED;
	}
});

Object.defineProperty(proto, 'inverseTransform', {
	get: function () {
		if (this._flags & TRANSFORM_UPDATED || !this._inverseTrans) {
			this._inverseTrans = this.transform.invert();
			this._flags &= ~TRANSFORM_UPDATED;
		}

		return this._inverseTrans.copy();
	}
});

proto._updateTransform = function (transform) {
	transform = transform || this.transform;
	transform.setContextTransform(this.ctx);
};

/**
 * Advance time
 */
proto._tick = function () {
	var self = this;
	var time = (new Date()).getTime() / 1000;
	var info = {viewport: self.viewport};

	if (this.framerate) {
		this.animationLoop.advanceToTime(time, function () {
			info.deltaTime = self.framerate;
			self.tick(self.framerate, info);
		});
	}
	// link framerate to draw rate
	else {
		var dt = 0;

		if (this.animationLoop.lastTime == 0) {
			dt = 1.0 / 60.0;
		}
		else {
			dt = time - this.animationLoop.lastTime;
		}

		info.deltaTime = dt;
		self.tick(dt, info);

		this.animationLoop.lastTime = time;
	}

	if (this.animationLoop.framerate) {
		info.frameDelta = time - this.animationLoop.lastTime;
	}
	else {
		info.frameDelta = 0;
	}

	this._draw(info);

	this.animationFrame = window.requestAnimationFrame(function () {
		self._tick();
	});
};

proto.clear = function () {
	var transform;
	var size   = this.viewport.size;
	var width  = size.x;
	var height = size.y;

	this.ctx.save();

	this._updateTransform(new T.Matrix());
	this.ctx.clearRect(0, 0, width, height);
	this._updateTransform();

	this.ctx.restore();
};

/**
 * Draw frame
 */
proto._draw = function (info) {
	if (this._flags & AUTO_CLEAR) {
		this.clear();
	}

	this.ctx.save();
	this._updateTransform();

	this.draw.call(this, this.ctx, info);

	this.ctx.restore();
};

/**
 * Start animation loop
 */
proto.startAnimating = function () {
	var self = this;

	if (!this.animationFrame) {
		this.animationFrame = window.requestAnimationFrame(function () {
			self._tick();
		});

		if (this.options.autoSetHeight) {
			this._addResizeListener();
		}
	}
};

/**
 * Stop animation loop
 */
proto.stopAnimating = function () {
	if (this.animationFrame) {
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;

		this._removeResizeListener();
	}
};

/**
 * Redraw frame
 *
 * When resizing
 */
proto.redraw = function () {
	this._draw();
};

/**
 * Get canvas offset from mouse event
 */
proto.offsetFromEvent = function (e) {
	var elem = this.element;
	var x = elem.offsetLeft;
	var y = elem.offsetTop;

	while (elem = elem.offsetParent) {
		x += elem.offsetLeft;
		y += elem.offsetTop;
	}

	var offset = new T.Vector(x, y);
	var scale = this.element.offsetWidth / this.element.width;

	if (!e.changedTouches) {
		var docElem = document.documentElement;

		offset.x = e.clientX - offset.x + docElem.scrollLeft;
		offset.y = e.clientY - offset.y + docElem.scrollTop;
	}
	// is touch event
	else {
		offset.x = e.changedTouches[0].pageX - offset.x;
		offset.y = e.changedTouches[0].pageY - offset.y;
	}

	offset = offset.mult(1.0 / scale);

	return offset;
};

/**
 * Get world position from relative pixel offset
 */
proto.worldPositionFromOffset = function (offset) {
	return this.inverseTransform.multVec(offset);
};

/**
 * Get relative pixel offset from world position
 */
proto.offsetFromWorldPosition = function (offset) {
	return this.transform.multVec(offset);
};
/**
 * Window resize handler
 */
proto._resizeEventHandler = null;

/**
 * Add event listeners for window resize
 */
proto._addResizeListener = function () {
	var self = this;

	if (!this._resizeEventHandler) {
		this._resizeEventHandler = function () {
			var parentNode = self.element.parentNode;
			var rect = parentNode.getBoundingClientRect();
			var ratio = self.element.height / self.element.width;

			self.element.style.height = parseInt(rect.width * ratio) + 'px';
		};

		window.addEventListener('resize', this._resizeEventHandler);
		window.addEventListener('orientationchange', this._resizeEventHandler);
		this._resizeEventHandler();
	}
};

/**
 * Remove event listeners for window resize
 */
proto._removeResizeListener = function () {
	if (this._resizeEventHandler) {
		window.removeEventListener('resize', this._resizeEventHandler);
		window.removeEventListener('orientationchange', this._resizeEventHandler);
		this._resizeEventHandler = null;
	}
};

}(Tetragon));
