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

		if (!this._inverseTrans) {
			this._inverseTrans = this.transform.invert();
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
