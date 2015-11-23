/**
 * @depend tetragon.js
 * @depend animation-loop.js
 * @depend vector.js
 * @depend matrix.js
 */

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

var proto = Canvas.prototype;

proto._updateViewport = function () {
	var element = this.element;
	var width   = +element.width;
	var height  = +element.height;

	this.viewport.size.x = width;
	this.viewport.size.y = height;
};

/**
 * Advance time
 */
proto._tick = function () {
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
proto._draw = function () {
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

proto.inverseTransform = function () {
	if (!this.inverseTrans) {
		this.inverseTrans = this.transform.invert();
	}

	return this.inverseTrans;
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

	var offset = new Tetragon.Vector(x, y);
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

}());
