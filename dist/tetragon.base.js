(function (w) {
'use strict';

w.Tetragon = w.Tetragon || {
	version: '0.1.9',
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

/**
 * Reset loop
 */
proto.reset = function () {
	this.lastTime = 0;
};

}(Tetragon));

/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var Vector = T.Vector = function (x, y) {
	if (Vector.prototype.isPrototypeOf(x)) {
		this.x = x.x;
		this.y = x.y;
	}
	else {
		this.x = parseFloat(x) || 0.0;
		this.y = parseFloat(y) || 0.0;
	}
};

var proto = Vector.prototype;

Object.defineProperty(proto, 'length', {
	get: function () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
});

Object.defineProperty(proto, 'lengthSquared', {
	get: function () {
		return this.x * this.x + this.y * this.y;
	}
});

Object.defineProperty(proto, 'negated', {
	get: function () {
		return new Vector(-this.x, -this.y);
	}
});

Object.defineProperty(proto, 'rotation', {
	get: function () {
		var a = Math.atan2(this.y, this.x);
		a = a < 0 ? a + 2.0 * Math.PI : a;
		return a / Math.PI * 180.0;
	}
});

Object.defineProperty(proto, 'integ', {
	get: function () {
		return new Vector(Math.floor(this.x), Math.floor(this.y));
	}
});

proto.add = function (vec) {
	return new Vector(this.x + vec.x, this.y + vec.y);
};

proto.sub = function (vec) {
	return new Vector(this.x - vec.x, this.y - vec.y);
};

proto.mult = function (val) {
	if (val === Object(val)) {
		return new Vector(this.x * val.x, this.y * val.y);
	}
	else {
		return new Vector(this.x * val, this.y * val);
	}
};

proto.div = function (val) {
	if (val === Object(val)) {
		return new Vector(this.x / val.x, this.y / val.y);
	}
	else {
		return new Vector(this.x / val, this.y / val);
	}
};

proto.normalize = function (mag) {
	if (mag === undefined) {
		mag = 1.0;
	}

	var len = this.length;

	if (len) {
		len = mag / len;
	}

	return new Vector(this.x * len, this.y * len);
};

proto.dot = function (vec) {
	return this.x * vec.x + this.y * vec.y;
};

proto.rotate = function (a) {
	var r = a / 180.0 * Math.PI;
	var c = Math.cos(r);
	var s = Math.sin(r);

	return new Vector(
		this.x * c - this.y * s,
		this.x * s + this.y * c
	);
};

proto.reflect = function (wall) {
	wall = wall.normalize();
	return this.sub(wall.mult(2.0 * wall.dot(this)));
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
	return new Vector(this.x << n, this.y << n);
};

proto.shr = function (n) {
	return new Vector(this.x >> n, this.y >> n);
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

	var m = this.mult(new T.Matrix([
		c, s,
		-s, c,
		0, 0,
	]));

	this.set(m);

	return this;
};

proto.mult = function (val) {
	if (T.Vector.prototype.isPrototypeOf(val)) {
		return new T.Vector(
			this[0] * val.x + this[2] * val.y + this[4],
			this[1] * val.x + this[3] * val.y + this[5]
		);
	}
	if (T.Matrix.prototype.isPrototypeOf(val)) {
		return new Matrix([
			this[0] * val[0] + this[2] * val[1],
			this[1] * val[0] + this[3] * val[1],
			this[0] * val[2] + this[2] * val[3],
			this[1] * val[2] + this[3] * val[3],
			this[0] * val[4] + this[2] * val[5] + this[4],
			this[1] * val[4] + this[3] * val[5] + this[5]
		]);
	}
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

var Range = T.Range = function (location, length) {
	this.location = location || 0;
	this.length = length || 0;
};

var proto = Range.prototype;

Object.defineProperty(proto, 'end', {
	enumerable: true,
	get: function () {
		return this.location + this.length;
	},
	set: function (end) {
		this.location = end - this.length;
	}
});

proto.contains = function (value) {
	if (T.Range.prototype.isPrototypeOf(val)) {
		return value.location >= this.location && value.end <= this.end;
	}
	else {
		return value >= this.location && value < this.end;
	}
};

proto.intersects = function (range) {
	return range.location < this.end && range.end > this.location;
};

proto.extend = function (val) {
	var end = this.end;

	if (Range.prototype.isPrototypeOf(val)) {
		if (val.location < this.location) {
			this.location = val.location;
			this.length = end - this.location;
		}
		else if (val.end > end) {
			this.length = val.end - this.location;
		}
	}
	else {
		if (val < this.location) {
			this.location = val;
			this.length = end - val;
		}
		else if (val > end) {
			this.length = val - location;
		}
	}
};

proto.copy = function () {
	return new Range(this.location, this.length);
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

var Rect = T.Rect = function (p, s) {
	if (Rect.prototype.isPrototypeOf(p)) {
		this.pos  = p.pos.copy();
		this.size = p.size.copy();
	}
	else {
		this.pos  = p ? p.copy() : new T.Vector();
		this.size = s ? s.copy() : new T.Vector();
	}
};

var proto = Rect.prototype;

Object.defineProperty(proto, 'maxPos', {
	enumerable: true,
	get: function () {
		return this.pos.add(this.size);
	},
	set: function (maxPos) {
		this.pos = maxPos.sub(this.size);
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

proto.contains = function (val) {
	var pos = this.pos;
	var maxPos = this.maxPos;

	if (T.Vector.prototype.isPrototypeOf(val)) {
		if (val.x >= pos.x && val.x < maxPos.x) {
			if (val.y >= pos.y && val.y < maxPos.y) {
				return true;
			}
		}
	}
	else if (T.Rect.prototype.isPrototypeOf(val)) {
		var rectPos = val.pos;
		var rectMaxPos = val.maxPos;

		if (rectPos.x >= pos.x && rectMaxPos.x <= maxPos.x) {
			if (rectPos.y >= pos.y && rectMaxPos.y <= maxPos.y) {
				return true;
			}
		}
	}

	return false;
};

proto.intersects = function (rect) {
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

proto.extend = function (val) {
	var maxPos = this.maxPos;

	if (T.Vector.prototype.isPrototypeOf(val)) {
		if (val.x < this.pos.x) {
			this.pos.x = val.x;
			this.size.x = maxPos.x - val.x;
		}
		else if (val.x > maxPos.x) {
			this.size.x = val.x - this.pos.x;
		}

		if (val.y < this.pos.y) {
			this.pos.y = val.y;
			this.size.y = maxPos.y - val.y;
		}
		else if (val.y > maxPos.y) {
			this.size.y = maxPos.y - this.pos.y;
		}
	}
	else if (T.Rect.prototype.isPrototypeOf(val)) {
		if (val.pos.x < this.pos.x) {
			this.pos.x = val.pos.x;
			this.size.x = maxPos.x - val.pos.x;
		}
		else if (val.maxPos.x > maxPos.x) {
			this.size.x = val.maxPos.x - this.pos.x;
		}

		if (val.pos.y < this.pos.y) {
			this.pos.y = val.pos.y;
			this.size.y = maxPos.y - val.pos.y;
		}
		else if (val.maxPos.y > maxPos.y) {
			this.size.y = val.maxPos.y - this.pos.y;
		}
	}
};

proto.copy = function () {
	return new Rect(this.pos, this.size);
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend rect.js
 */

(function (T) {
'use strict';

var QuadTree = T.QuadTree = function (rect) {
	Quad.call(this, rect);
};

var Quad = QuadTree.Quad = function (rect, parent, idx) {
	this.parent = parent;
	this.idx = idx;
	this.quads = [];
	this.quadFlags = 0;
	this.items = [];
	this.rect = new T.Rect(rect);
};

Quad.prototype.addItem = function (object, rect, item) {
	var index;
	var quad = this;
	var center;

	if (!item) {
		item = new Item(object, rect);
	}

	while (quad) {
		center = quad.rect.center;

		if (!quad.items.length) {
			item.quad = quad;
			quad.items.push(item);
			break;
		}
		else if (quad.rect.contains(rect)) {
			if (rect.pos.x + rect.size.x < center.x) {
				index = 0;
			}
			else if (rect.pos.x >= center.x) {
				index = 2;
			}
			else {
				item.quad = quad;
				quad.items.push(item);
				break;
			}

			if (rect.pos.y + rect.size.y < center.y) {
				index += 0;
			}
			else if (rect.pos.y >= center.y) {
				index += 1;
			}
			else {
				item.quad = quad;
				quad.items.push(item);
				break;
			}
		}
		else {
			item.quad = quad;
			quad.items.push(item);
			break;
		}

		if (!quad.quads[index]) {
			var quadRect = quad.rect.copy();

			quadRect.size.x *= 0.5;
			quadRect.size.y *= 0.5;

			switch (index) {
				case 0: {
					break;
				}
				case 1: {
					quadRect.pos.y += quadRect.size.y;
					break;
				}
				case 2: {
					quadRect.pos.x += quadRect.size.x;
					break;
				}
				case 3: {
					quadRect.pos.x += quadRect.size.x;
					quadRect.pos.y += quadRect.size.y;
					break;
				}
			}

			quad.quads[index] = new Quad(quadRect, quad, index);
			quad.quadFlags |= (1 << index);
		}

		quad = quad.quads[index];
	}

	return item;
};

Quad.prototype.forEachItemInRect = function (callback, rect) {
	var i;
	var quad = this;

	for (i = 0; i < quad.items.length; i ++) {
		var item = quad.items[i];

		if (rect.intersects(item.rect)) {
			callback(item.item, item);
		}
	}

	for (i = 0; i < quad.quads.length; i ++) {
		var subquad = quad.quads[i];

		if (subquad && rect.intersects(subquad.rect)) {
			subquad.forEachItemInRect(callback, rect);
		}
	}
};

QuadTree.prototype = new Quad();

var Item = QuadTree.Item = function (item, rect) {
	this.quad = null;
	this.item = item;
	this.rect = rect.copy();
};

Item.prototype.remove = function (toQuad) {
	var idx;
	var parent;
	var quad = this.quad;

	idx = quad.items.indexOf(this);
	quad.items.splice(idx, 1);

	for (; quad; quad = parent) {
		if (quad == toQuad) {
			break;
		}

		parent = quad.parent;

		if (parent && !quad.items.length && !quad.quadFlags) {
			delete parent.quads[quad.idx];
			parent.quadFlags &= ~(1 << quad.idx);
		}
	}
};

Item.prototype.move = function (rect) {
	var quad = this.quad;

	// search lowest quad containing new rect
	while (quad.parent) {
		if (quad.rect.contains(rect)) {
			break;
		}

		quad = quad.parent;
	}

	this.rect = new T.Rect(rect);

	// remove from current quad but do not remove new quad
	this.remove(quad);
	quad.addItem(null, rect, this);
};

}(Tetragon));

/**
 * @depend tetragon.js
 * @depend animation-loop.js
 * @depend vector.js
 * @depend matrix.js
 */

(function (window, document, T) {
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
	}, options);

	this.element       = options.element;
	this.ctx           = options.element.getContext('2d');
	this.tick          = options.tick;
	this.draw          = options.draw;
	this.framerate     = options.framerate;
	this.animationLoop = new T.AnimationLoop(this.framerate);
	this._viewport     = new T.Rect();
	this._inverseTrans = null;
	this._flags        = 0;
	this.options       = options;
	this.matrixStack   = [];

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
		var transform;

		if (!this.matrixStack.length) {
			this._prepareMatrixStack();
		}

		return this.matrixStack[this.matrixStack.length - 1].copy();
	},
	set: function (transform) {
		var matrix;

		if (!this.matrixStack.length) {
			this._prepareMatrixStack();
		}

		matrix = this.matrixStack[this.matrixStack.length - 1];
		matrix.set(transform);

		matrix.setContextTransform(this.ctx);
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

proto._prepareMatrixStack = function () {
	var transform = new T.Matrix();

	if (this.options.origin) {
		transform.translate(this.options.origin.mult(this.viewport.size));
	}

	if (this.options.scale) {
		transform.scale(this.options.scale);
	}

	this.matrixStack.push(transform);
};

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
	var info = {viewport: self.viewport, ctx: self.ctx};

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
		this.animationLoop.reset();

		this.animationFrame = window.requestAnimationFrame(function () {
			self._tick();
		});
	}
};

/**
 * Stop animation loop
 */
proto.stopAnimating = function () {
	if (this.animationFrame) {
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
	}
};

/**
 * Redraw frame
 */
proto.redraw = function () {
	this._draw();
};

/**
 * Get canvas offset from mouse event
 */
proto.offsetFromEvent = function (e) {
	var elem = this.element;
	var rect = elem.getBoundingClientRect();
	var offset = new T.Vector(rect.left, rect.top);

	if (!e.changedTouches) {
		offset.x = e.clientX - offset.x;
		offset.y = e.clientY - offset.y;
	}
	// is touch event
	else {
		offset.x = e.changedTouches[0].pageX - offset.x;
		offset.y = e.changedTouches[0].pageY - offset.y;
	}

	offset = offset.mult(new T.Vector(
		this.element.width / rect.width,
		this.element.height / rect.height
	));

	return offset;
};

/**
 * Get world position from relative pixel offset
 */
proto.worldPositionFromOffset = function (offset) {
	return this.inverseTransform.mult(offset);
};

/**
 * Get relative pixel offset from world position
 */
proto.offsetFromWorldPosition = function (offset) {
	return this.transform.mult(offset);
};

/**
 * Push new matrix to stack
 */
proto.pushMatrix = function () {
	var matrix;

	if (this.matrixStack.length) {
		matrix = this.matrixStack[this.matrixStack.length - 1].copy();
	}
	else {
		matrix = this.transform;
	}

	this.matrixStack.push(matrix);
};

/**
 * Pop matrix from stack
 */
proto.popMatrix = function () {
	if (this.matrixStack.length > 1) {
		this.matrixStack.pop();
		this.transform = this.matrixStack[this.matrixStack.length - 1];
	}
};

}(window, document, Tetragon));
