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

w.Tetragon = w.Tetragon || {
	version: '0.1.0',
};

}(window));

/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var Tween = T.Tween = function (options) {
	options = T.extend({
		startValue: 0,
		endValue: 0,
		duration: 1,
		done: null,
		easeFunc: null,
	}, options);

	this.time       = 0;
	this.state      = 0;
	this.startValue = options.startValue;
	this.endValue   = options.endValue;
	this.duration   = options.duration;
	this.done       = options.done;
	this.options    = options;
};

Tween.STATE_RUNNING = 1;
Tween.STATE_ENDED   = 2;

Tween.easeInQuad = function (t) {
	return t*t;
};

Tween.easeOutQuad = function (t) {
	return -t*(t-2);
};

Tween.easeInOutQuad = function (t) {
	if ((t/=0.5) < 1) return 0.5*t*t;
	return -0.5 * ((--t)*(t-2) - 1);
};

Tween.easeInCubic = function (t) {
	return t*t*t;
};

Tween.easeOutCubic = function (t) {
	return ((t=t-1)*t*t + 1);
};

Tween.easeInOutCubic = function (t) {
	if ((t/=0.5) < 1) return 0.5*t*t*t;
	return 0.5*((t-=2)*t*t + 2);
};

Tween.easeInQuart = function (t) {
	return t*t*t*t;
};

Tween.easeOutQuart = function (t) {
	return -((t=t-1)*t*t*t - 1);
};

Tween.easeInOutQuart = function (t) {
	if ((t/=0.5) < 1) return 0.5*t*t*t*t;
	return -0.5 * ((t-=2)*t*t*t - 2);
};

Tween.easeInQuint = function (t) {
	return t*t*t*t*t;
};

Tween.easeOutQuint = function (t) {
	return ((t=t-1)*t*t*t*t + 1);
};

Tween.easeInOutQuint = function (t) {
	if ((t/=0.5) < 1) return 0.5*t*t*t*t*t;
	return 0.5*((t-=2)*t*t*t*t + 2);
};

Tween.easeInSine = function (t) {
	return -1 * Math.cos(t * (Math.PI/2)) + 1;
};

Tween.easeOutSine = function (t) {
	return Math.sin(t * (Math.PI/2));
};

Tween.easeInOutSine = function (t) {
	return -0.5 * (Math.cos(Math.PI*t) - 1);
};

Tween.easeInExpo = function (t) {
	return (t==0) ? b : 1 * Math.pow(2, 10 * (t - 1));
};

Tween.easeOutExpo = function (t) {
	return (t==1) ? b+1 : 1 * (-Math.pow(2, -10 * t) + 1);
};

Tween.easeInOutExpo = function (t) {
	if (t==0) return 0;
	if (t==1) return 1;
	if ((t/=0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
	return 0.5 * (-Math.pow(2, -10 * --t) + 2);
};

Tween.easeInCirc = function (t) {
	return -(Math.sqrt(1 - t*t) - 1);
};

Tween.easeOutCirc = function (t) {
	return Math.sqrt(1 - (t=t-1)*t);
};

Tween.easeInOutCirc = function (t) {
	if ((t/=0.5) < 1) return -0.5 * (Math.sqrt(1 - t*t) - 1);
	return 0.5 * (Math.sqrt(1 - (t-=2)*t) + 1);
};

Tween.easeInElastic = function (t) {
	var s=1.70158;var p=0;var a=1;
	if (t==0) return b;  if (t==1) return b+1;  if (!p) p=0.3;
	if (a < Math.abs(1)) { a=1; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (1/a);
	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
};

Tween.easeOutElastic = function (t) {
	var s=1.70158;var p=0;var a=1;
	if (t==0) return b;  if (t==1) return b+1;  if (!p) p=0.3;
	if (a < Math.abs(1)) { a=1; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (1/a);
	return a*Math.pow(2,-10*t) * Math.sin( (t*1-s)*(2*Math.PI)/p ) + 1;
};

Tween.easeInOutElastic = function (t) {
	var s=1.70158;var p=0;var a=1;
	if (t==0) return b;  if ((t/=0.5)==2) return b+1;  if (!p) p=(1.3*1.5);
	if (a < Math.abs(1)) { a=1; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (1/a);
	if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
	return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p )*0.5 + 1;
};

Tween.easeInBack = function (t, s) {
	if (s == undefined) s = 1.70158;
	return t*t*((s+1)*t - s);
};

Tween.easeOutBack = function (t, s) {
	if (s == undefined) s = 1.70158;
	return ((t=t-1)*t*((s+1)*t + s) + 1);
};

Tween.easeInOutBack = function (t, s) {
	if (s == undefined) s = 1.70158;
	if ((t/=0.5) < 1) return 0.5*(t*t*(((s*=(1.525))+1)*t - s));
	return 0.5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
};

Tween.easeInBounce = function (t) {
	return 1 - Tween.easeOutBounce (1-t, 0);
};

Tween.easeOutBounce = function (t) {
	if (t < (1/2.75)) {
		return (7.5625*t*t);
	} else if (t < (2/2.75)) {
		return (7.5625*(t-=(1.5/2.75))*t + 0.75);
	} else if (t < (2.5/2.75)) {
		return (7.5625*(t-=(2.25/2.75))*t + 0.9375);
	} else {
		return (7.5625*(t-=(2.625/2.75))*t + 0.984375);
	}
};

Tween.easeInOutBounce = function (t) {
	if (t < 0.5) return Tween.easeInBounce (t*2, 0) * 0.5;
	return Tween.easeOutBounce (t*2-1, 0) * 0.5 + 0.5;
};

var proto = Tween.prototype;

Object.defineProperty(proto, 'value', {
	enumerable: true,
	get: function () {
		var d = this.time / this.duration;

		if (this.options.easeFunc) {
			d = this.options.easeFunc(d);
		}

		return this.startValue + d * (this.endValue - this.startValue);
	},
});

proto.tick = function (dt) {
	var delta;

	this.time = Math.min(this.time + dt, this.duration);
	delta = this.time / this.duration;

	if (this.time >= this.duration) {
		if (this.done) {
			this.done();
			this.done = null;
		}
	}
};

proto.reset = function () {
	this.time = 0;
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
		restDist = p2.p.sub(p1.p).length;
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
	var l = d.length;

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
	this.construct = options.construct;
	this.destruct = options.destruct;
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

	if (typeof component == 'string') {
		component = this.system.component(component);

		if (!component) {
			return null;
		}
	}

	if (component.data[this.id - 1]) {
		return null;
	}

	var instance = {};

	if (component.construct) {
		component.construct.apply(instance, args);
	}

	instance.entity = this;
	component.data[this.id - 1] = instance;
	this.system.entities[this.id - 1] |= (1 << component.id);

	return instance;
};

proto.removeComponent = function (component) {
	if (typeof component == 'string') {
		component = this.system.component(component);

		if (!component) {
			return null;
		}
	}

	if (!component.data[this.id - 1]) {
		return null;
	}

	if (component.destruct) {
		component.destruct.apply(component.data[this.id - 1]);
	}

	delete component.data[this.id - 1];
	this.system.entities[this.id - 1] &= ~(1 << component.id);
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

			if (component.destruct) {
				component.destruct.apply(component.data[this.id - 1]);
			}

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
 */

(function (T) {
'use strict';

var QuadTree = T.QuadTree = function (rect) {
	this.quads = [];
	this.quadFlags = 0;
	this.items = [];
	this.rect = rect.copy();
};

var Quad = QuadTree.Quad = function (parent, idx, rect) {
	this.parent = parent;
	this.idx = idx;
	this.quads = [];
	this.quadFlags = 0;
	this.items = [];
	this.rect = rect.copy();
};

var Item = QuadTree.Item = function (item, rect) {
	this.quad = null;
	this.item = item;
	this.rect = rect.copy();
};

Item.prototype.remove = function () {
	var idx;
	var parent;
	var quad = this.quad;

	idx = quad.items.indexOf(this);
	quad.items.splice(idx, 1);

	for (; quad; quad = parent) {
		parent = quad.parent;

		if (parent && !quad.items.length && !quad.quadFlags) {
			delete parent.quads[quad.idx];
			parent.quadFlags &= ~(1 << quad.idx);
		}
	}
};

Item.prototype.move = function (rect) {
	throw 'unimplemented method move';
};

QuadTree.prototype.addItem = function (item, rect) {
	var index;
	var quad = this;
	var item = new Item(item, rect);
	var center;

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

			quad.quads[index] = new Quad(quad, index, quadRect);
			quad.quadFlags |= (1 << index);
		}

		quad = quad.quads[index];
	}

	return item;
};

QuadTree.prototype.forEachItemInRect = function (callback, rect, quad) {
	var i;

	quad = quad || this;

	for (i = 0; i < quad.items.length; i ++) {
		var item = quad.items[i];

		if (rect.intersects(item.rect)) {
			callback(item.item, item);
		}
	}

	for (i = 0; i < quad.quads.length; i ++) {
		var subquad = quad.quads[i];

		if (subquad && rect.intersects(subquad.rect)) {
			this.forEachItemInRect(callback, rect, subquad);
		}
	}
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
				transform.translate(this.options.origin.mult(this.viewport.size));
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
		var doc = document.documentElement;
		var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
		var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

		offset.x = e.clientX - offset.x + left;
		offset.y = e.clientY - offset.y + top;
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
	return this.inverseTransform.mult(offset);
};

/**
 * Get relative pixel offset from world position
 */
proto.offsetFromWorldPosition = function (offset) {
	return this.transform.mult(offset);
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

}(window, document, Tetragon));
