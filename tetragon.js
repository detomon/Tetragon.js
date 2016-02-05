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

(function (w) {
'use strict';

w.Tetragon = w.Tetragon || {};

}(window));

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

var Controls = T.Controls = function () {
	this.keys = 0;
};

Controls.LEFT   = 1 << 0;
Controls.TOP    = 1 << 1;
Controls.RIGHT  = 1 << 2;
Controls.BOTTOM = 1 << 3;

Controls.keyMap = {
	37: Controls.LEFT,   // arrow left
	38: Controls.TOP,    // arrow up
	39: Controls.RIGHT,  // arrow right
	40: Controls.BOTTOM, // arrow down

	65: Controls.LEFT,   // A
	87: Controls.TOP,    // W
	68: Controls.RIGHT,  // D
	83: Controls.BOTTOM  // S
};

var proto = Controls.prototype;

proto.pressKeyWithCode = function (keyCode) {
	if (Controls.keyMap[keyCode]) {
		this.keys |= Controls.keyMap[keyCode];
	}
};

proto.releaseKeyWithCode = function (keyCode) {
	if (Controls.keyMap[keyCode]) {
		this.keys &= ~Controls.keyMap[keyCode];
	}
};

proto.isKeyPressed = function (key) {
	return this.keys & key;
};

proto.reset = function () {
	this.keys = 0;
};

}(Tetragon));

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

	return new Entity(id, this);
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

proto.removeComponent = function (component) {
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
	var options    = options || {};
	var loadCount  = 0;
	var loadedImgs = {};

	function waitForLoad(src) {
		var image = new Image();

		image.onload = function () {
			if (!loadedImgs[src]) {
				loadedImgs[src] = image;

				if (options.load) {
					options.load(image);
				}

				if (++ loadCount >= images.length) {
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

	if (images.length == 0) {
		if (options.done) {
			options.done(loadedImgs);
		}
	}

	for (i = 0; i < images.length; i ++) {
		var src = images[i];

		// assuming an image element
		if (src === Object(src)) {
			src = src.src;
		}

		waitForLoad(src);
	}
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
		for (var i = 0; i < 6; i ++) {
			this[i] = values[i];
		}
	}
	else {
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 1;
		this[4] = 0;
		this[5] = 0;
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
	var mat = new T.Matrix();

	mat[0] = this[0];
	mat[1] = this[1];
	mat[2] = this[2];
	mat[3] = this[3];
	mat[4] = this[4];
	mat[5] = this[5];

	return mat;
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

/**
 * Defines a point mass
 *
 * The point is initialized with an initial `position` and a `mass`
 * More mass means more inertness
 */
var PointMass = T.PointMass = function (position, mass) {
	// current position
	this.p = position.copy();

	// previous position
	this.pp = position.copy();

	// acceleration for current frame
	this.a = new T.Vector(); // null vector

	// mass; set to 1.0 if not defined
	this.mass = mass || 1.0;

	// inverse mass
	if (this.mass == 0.0) {
		this.invMass = Number.MAX_VALUE;
	}
	else if (this.mass == Number.MAX_VALUE) {
		this.invMass = 0.0;
	}
	else {
		this.invMass = 1.0 / this.mass;
	}

	// set default damping value
	this.damping = 0.997;

	// `true` if pinned to current position
	this.pinned = false;
};

var proto = PointMass.prototype;

/**
 * Move point to next position
 */
proto.inertia = function(dt) {
	// time depending factor used for acceleration
	// dtf = 0.5 * dt^2
	var dtf = 0.5 * dt * dt;

	// get velocity vector and add damping
	// v = (p - pp) * damping
	var v = this.p.sub(this.pp).mult(this.damping);

	// this is more accurate, but also slower
	// v = (p - pp) * damping ^ dt
	//var v = this.p.sub(this.pp).mult(Math.pow(this.damping, dt));

	// calculate next position by adding velocity
	// and acceleration to current position
	// n = p + v + a * dtf
	var n = this.p.add(v.add(this.a.mult(dtf)));

	// set previous position to current position
	this.pp = this.p.copy();

	// set current position to next position
	this.p = n;

	// clear acceleration for current step
	this.a = new T.Vector();
};

/**
 * Add force vector
 */
proto.applyForce = function(force) {
	// add force multiplied with inverse of mass
	// a += force * (1.0 / mass)
	this.a = this.a.add(force.mult(this.invMass));
};

/**
 * Pin point to its current position
 */
proto.pin = function() {
	this.pp     = this.p.copy();
	this.pinned = true;
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
	this.frameDelta    = 0.0;
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
		if (this._flags & TRANSFORM_UPDATED) {
			this._inverseTrans = this._transform.invert();
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

	this.animationLoop.advanceToTime(time, function () {
		self.tick(self.framerate, {
			viewport: self.viewport,
		});
	});

	this.frameDelta = (time - this.animationLoop.lastTime) / this.animationLoop.framerate;
	this._draw();

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
proto._draw = function () {
	if (this._flags & AUTO_CLEAR) {
		this.clear();
	}

	this.ctx.save();
	this._updateTransform();

	this.draw.call(this, this.ctx, {
		viewport: this.viewport,
		frameDelta: this.frameDelta
	});

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

	offset.x -= this.element.offsetWidth * 0.5;
	offset.y -= this.element.offsetHeight * 0.5;

	offset = offset.mult(1.0 / scale);

	return offset;
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

/**
 * @depend tetragon.js
 * @depend point-mass.js
 */

(function (T) {
'use strict';

/**
 * Defines a constraint between two point masses
 *
 * Keeps the points `p1` and `p1` at a given resting distance `restDist`
 * A `stiffness` value of 1.0 sets the maximum responsiveness
 * Values below 1.0 and above 0.0 make the constraint more "rubbery"
 *
 * If `restDist` is omitted, it is set to the initial distance
 *   between `p1` and `p2`
 * If `stiffness` is omitted, it is set to its maximum value 1.0
 */
var Constraint = T.Constraint = function (p1, p2, restDist, stiffness) {
	// set current distance as resting distance if not defined
	if (restDist === undefined) {
 		restDist = p2.p.sub(p1.p).length();
	}

	// set default stiffness to maximum if not defined
	if (stiffness === undefined) {
		stiffness = 1.0;
	}

	// set controlling points
	this.p1 = p1;
	this.p2 = p2;

	// set resting distance
	this.restDist = restDist;

	// set stiffness
	this.stiffness = stiffness;
}

var proto = Constraint.prototype;

/**
 * Solve step
 */
proto.solve = function() {
	var p1 = this.p1;
	var p2 = this.p2;

	// current distance vector between points
	// d = p1 - p2
	var d = p1.p.sub(p2.p);

	// scalar distance between points
	// l = |d|
	var l = d.length();

	var r = 0.0;

	// proportion between current distance and resting distance
	if (l != 0.0) {
		r = (this.restDist - l) / l;
	}

	// distance vector differing from resting distance
	// d *= r
	d = d.mult(r);

	// mass influence of `p1` as fraction between 0.0 and 1.0
	// `0.5` would mean that `p1` and `p2` have the same mass
	var f1 = 1.0 - p1.mass / (p1.mass + p2.mass);

	// influences of `p1` and `p2`
	var s1 = f1 * this.stiffness;
	var s2 = this.stiffness - s1;

	if (!p1.pinned) {
		// p1 += d * s1
		p1.p = p1.p.add(d.mult(s1));
	}

	if (!p2.pinned) {
		// p2 -= d * s2
		p2.p = p2.p.sub(d.mult(s2));
	}
};

}(Tetragon));
