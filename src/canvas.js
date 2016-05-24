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
	var self = this;

	this._draw({
		viewport: self.viewport,
		ctx: self.ctx,
		deltaTime: 0,
		frameDelta: 0,
	});
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
