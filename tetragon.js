(function () {
'use strict';

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

	var offset = new Vector(x, y);
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

var Entity = Tetragon.Entity = function (id, system) {
	this.id = id;
	this.system = system;
};

Entity.prototype.addComponent = function (component, params) {
	if (component.data[this.id]) {
		return null;
	}

	var instance = components.createInstance(params);
	instance.entity = this;
	component.data[this.id] = instance;
	this.system.entities[this.id] |= (1 << component.id);

	return instance;
};

Entity.prototype.componentData = function (name) {
	var component = this.system.namedComponents[name];

	if (!component) {
		return null;
	}

	return component.data[this.id];
};

Entity.prototype.delete = function () {
	var n = 0;
	var system = this.system;

	if (system.entities[entity.id] === undefined) {
		return;
	}

	var mask = system.entities[this.id];

	while (mask) {
		if (!(mask & 0xFF)) {
			mask >>= 8;
			n += 8;
		}

		if (mask & 1) {
			var component = system.components[n];
			component.data[entity.id] = undefined;

			mask >>= 1;
			n ++;
		}
	}

	system.entities[entity.id] = undefined;
	system.freeEntites.push(entity.id);
};

var EntityComponent = Tetragon.EntityComponent = function (id, options) {
	this.id = id;
	this.name = options.name;
	this.createInstance = options.createInstance;
	this.process = options.process;
	this.data = [];
};

var EntitySystem = Tetragon.EntitySystem = function () {
	this.entities = [];
	this.freeEntites = [];
	this.components = [];
	this.namedComponents = {};
};

EntitySystem.prototype.getComponent = function (name) {
	return this.namedComponents[name];
};

EntitySystem.prototype.createComponent = function (options) {
	var id = this.component.length;
	var component = new EntityComponent(id, options);
	this.components.push(component);
	this.namedComponents[component.name] = component;

	return component;
};

EntitySystem.prototype.getEntity = function (id) {
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

}());

(function () {
'use strict';

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
	window.Tetragon = {};
}(window));

(function () {
'use strict';

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

	return new Vector (x, y);
};

}());
