(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

/**
 * Animation loop
 */
var AnimationLoop = Tetragon.AnimationLoop = function (framerate) {
	this.framerate = framerate;
	this.lastTime  = 0;
}

/**
 * Advance animation loop to new time
 *
 * `tickFunc` is called every frame
 */
AnimationLoop.prototype.advanceToTime = function (time, tickFunc) {
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

}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

/**
 * Encapsulates canvas animation
 */
var Canvas = Tetragon.Canvas = function (options) {
	this.element       = options.element;
	this.viewport      = new Tetragon.Rect();
	this.ctx           = options.element.getContext('2d');
	this.tick          = options.tick || function () {};
	this.draw          = options.draw || function () {};
	this.framerate     = options.framerate || (1.0 / 120.0);
	this.frameDelta    = 0.0;
	this.animationLoop = new Tetragon.AnimationLoop(this.framerate);
	this.transform     = new Tetragon.Matrix();
	this.inverseTrans  = new Tetragon.Matrix();

	this._updateViewport();
};

Canvas.prototype._updateViewport = function () {
	var element = this.element;
	var width   = +element.width;
	var height  = +element.height;

	this.viewport.size.x = width;
	this.viewport.size.y = height;
};

/**
 * Advance time
 */
Canvas.prototype._tick = function () {
	var self = this;
	var time = (new Date()).getTime() / 1000;

	this._updateViewport();

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

/**
 * Draw frame
 */
Canvas.prototype._draw = function () {
	this._updateViewport();

	var size   = this.viewport.size;
	var width  = size.x;
	var height = size.y;

	this.ctx.clearRect(0, 0, width, height);
	this.ctx.save();

	this.transform = new Tetragon.Matrix();
	this.inverseTrans = null;

	this.draw(this.ctx, {
		viewport: this.viewport,
		frameDelta: this.frameDelta
	});

	this.ctx.restore();
};

Canvas.prototype.inverseTransform = function () {
	if (!this.inverseTrans) {
		this.inverseTrans = this.transform.invert();
	}

	return this.inverseTrans;
};

/**
 * Start animation loop
 */
Canvas.prototype.startAnimating = function () {
	var self = this;

	if (!this.animationFrame) {
		this.animationFrame = window.requestAnimationFrame(function () {
			self._tick();
		});
	}
};

/**
 * Stop animation loop
 */
Canvas.prototype.stopAnimating = function () {
	if (this.animationFrame) {
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
	}
};

/**
 * Redraw frame
 *
 * When resizing
 */
Canvas.prototype.redraw = function () {
	this._draw();
};

/**
 * Get canvas offset from mouse event
 */
Canvas.prototype.offsetFromEvent = function (e) {
	var elem = this.element;
	var x = elem.offsetLeft;
	var y = elem.offsetTop;

	while (elem = elem.offsetParent) {
		x += elem.offsetLeft;
		y += elem.offsetTop;
	}

	var offset = new Tetragon.Vector(x, y);
	var scale = this.element.offsetWidth / this.element.width;

	if (!e.changedTouches) {
		offset.x = e.clientX - offset.x + document.documentElement.scrollLeft;
		offset.y = e.clientY - offset.y + document.documentElement.scrollTop;
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

}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

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
var Constraint = Tetragon.Constraint = function (p1, p2, restDist, stiffness) {
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

/**
 * Solve step
 */
Constraint.prototype.solve = function() {
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

}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

var Controls = Tetragon.Controls = function () {
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

Controls.prototype.pressKeyWithCode = function (keyCode) {
	if (Controls.keyMap[keyCode]) {
		this.keys |= Controls.keyMap[keyCode];
	}
};

Controls.prototype.releaseKeyWithCode = function (keyCode) {
	if (Controls.keyMap[keyCode]) {
		this.keys &= ~Controls.keyMap[keyCode];
	}
};

Controls.prototype.isKeyPressed = function (key) {
	return this.keys & key;
};

Controls.prototype.reset = function () {
	this.keys = 0;
};

}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

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

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

var Matrix = Tetragon.Matrix = function (values) {
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

Matrix.prototype.translate = function (vec) {
	this[4] += vec.x * this[0] + vec.y * this[2];
	this[5] += vec.x * this[1] + vec.y * this[3];
};

Matrix.prototype.scale = function (vec) {
	this[0] *= vec.x;
	this[2] *= vec.x;
	this[1] *= vec.y;
	this[3] *= vec.y;
};

Matrix.prototype.multVec = function (vec) {
	return new Tetragon.Vector(
		this[0] * vec.x + this[2] * vec.y + this[4],
		this[1] * vec.x + this[3] * vec.y + this[5]
	);
};

Matrix.prototype.multiply = function (mat) {
	return new Matrix([
		this[0] * mat[0] + this[2] * mat[1],
		this[1] * mat[0] + this[3] * mat[1],
		this[0] * mat[2] + this[2] * mat[3],
		this[1] * mat[2] + this[3] * mat[3],
		this[0] * mat[4] + this[2] * mat[5] + this[4],
		this[1] * mat[4] + this[3] * mat[5] + this[5]
	]);
};

Matrix.prototype.invert = function () {
	var det;
	var mat = new Tetragon.Matrix();

	mat[0] =  this[3];
	mat[1] = -this[1];
	mat[2] = -this[2];
	mat[3] =  this[0];
	mat[4] =  this[2] * this[5] - this[3] * this[4];
	mat[5] = -this[0] * this[5] + this[1] * this[4];

	det = this[0] * mat[0] + this[2] * mat[1];

	if (det == 0.0) {
		return this;
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

Matrix.prototype.copy = function () {
	var mat = new Tetragon.Matrix();

	mat[0] = this[0];
	mat[1] = this[1];
	mat[2] = this[2];
	mat[3] = this[3];
	mat[4] = this[4];
	mat[5] = this[5];

	return mat;
};

Matrix.prototype.setContextTransform = function (ctx) {
	ctx.setTransform(this[0], this[1], this[2], this[3], this[4], this[5]);
};

}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

/**
 * Defines a point mass
 *
 * The point is initialized with an initial `position` and a `mass`
 * More mass means more inertness
 */
var PointMass = Tetragon.PointMass = function (position, mass) {
	// current position
	this.p = position.copy();

	// previous position
	this.pp = position.copy();

	// acceleration for current frame
	this.a = new Tetragon.Vector(); // null vector

	// mass; set to 1.0 if not defined
	this.mass = mass || 1.0;

	// set default damping value
	this.damping = 0.997;

	// `true` if pinned to current position
	this.pinned = false;
}

/**
 * Move point to next position
 */
PointMass.prototype.inertia = function(dt) {
	// time depending factor used for acceleration
	// dtf = 0.5 * dt^2
	var dtf = 0.5 * dt * dt;

	// get velocity vector and add damping
	// v = (p - pp) * damping
	var v = this.p.sub(this.pp).mult(this.damping);

	// calculate next position by adding velocity
	// and acceleration to current position
	// n = p + v + a * dtf
	var n = this.p.add(v.add(this.a.mult(dtf)));

	// set previous position to current position
	this.pp = this.p.copy();

	// set current position to next position
	this.p = n;

	// clear acceleration for current step
	this.a = new Tetragon.Vector();
};

/**
 * Add force vector
 */
PointMass.prototype.applyForce = function(force) {
	// add force multiplied with inverse of mass
	// a += force * (1.0 / mass)
	this.a = this.a.add(force.mult(1.0 / this.mass));
};

/**
 * Pin point to its current position
 */
PointMass.prototype.pin = function() {
	this.pp     = this.p.copy();
	this.pinned = true;
};

}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

var Range = Tetragon.Range = function (start, length) {
	this.start = start || 0;
	this.length = length || 0;

};

Object.defineProperty(Range.prototype, 'end', {
	enumerable: true,
	get: function () {
		return this.start + this.length;
	},
	set: function (end) {
		this.length = end - this.start;
	}
});

Range.prototype.intersectsWithPoint = function (point) {
	return point.x >= this.start && point.y <= this.end;
};

Range.prototype.intersectsWithRange = function (range) {
	return range.start < this.end && range.end > this.start;
};

}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

var Rect = Tetragon.Rect = function (p, s) {
	this.pos  = p ? p.copy() : new Tetragon.Vector();
	this.size = s ? s.copy() : new Tetragon.Vector();
};

Rect.prototype.intersectsWithRect = function (rect) {
	if (rect.pos.x < this.pos.x + this.size.x && rect.pos.x + rect.size.x > this.pos.x) {
		if (rect.pos.y < this.pos.y + this.size.y && rect.pos.y + rect.size.y > this.pos.y) {
			return true;
		}
	}

	return false;
};

}());

/**
 * Polyfill for window.requestAnimationFrame
 *
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
(function () {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame =
		  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
}());

(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

var Vector = Tetragon.Vector = function (x, y) {
	this.x = parseFloat(x) || 0.0;
	this.y = parseFloat(y) || 0.0;
};

Vector.prototype.add = function (vec) {
	return new Vector(this.x + vec.x, this.y + vec.y);
};

Vector.prototype.sub = function (vec) {
	return new Vector(this.x - vec.x, this.y - vec.y);
};

Vector.prototype.inc = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
};

Vector.prototype.dec = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
};

Vector.prototype.shl = function (n) {
	return new Vector(
		this.x << n,
		this.y << n
	);
};

Vector.prototype.shr = function (n) {
	return new Vector(
		this.x >> n,
		this.y >> n
	);
};

Vector.prototype.integ = function (n) {
	return new Vector(
		this.x | 0,
		this.y | 0
	);
};

Vector.prototype.mult = function (fac) {
	return new Vector(this.x * fac, this.y * fac);
};

Vector.prototype.length = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.normalize = function (length) {
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

Vector.prototype.multVec = function (vec) {
	return new Vector(this.x * vec.x, this.y * vec.y);
};

Vector.prototype.dot = function (vec) {
	return this.x * vec.x + this.y * vec.y
};

Vector.prototype.reflect = function (wall) {
	wall = wall.normalize();
	return this.sub(wall.mult(2.0 * wall.dot(this)));
};

Vector.prototype.negate = function (wall) {
	return new Vector(-this.x, -this.y);
};

Vector.prototype.copy = function () {
	return new Vector(this.x, this.y);
};

Vector.prototype.rotate = function (a) {
	var r = a / 180.0 * Math.PI;
	var c = Math.cos(r);
	var s = Math.sin(r);

	var x = this.x * c - this.y * s;
	var y = this.x * s + this.y * c;

	return new Vector(x, y);
};

Vector.prototype.copy = function (a) {
	return new Vector(this.x, this.y);
};

}());
