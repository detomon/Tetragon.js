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
	this.curValue   = 0;
	this.state      = 0;
	this.startValue = options.startValue;
	this.endValue   = options.endValue;
	this.duration   = options.duration;
	this.done       = options.done;
	this.options    = options;
};

Tween.STATE_RUNNING = 1;
Tween.STATE_ENDED   = 2;

Tween.easeInQuad = function (x, t, b, c, d) {
	return c*(t/=d)*t + b;
};

Tween.easeOutQuad = function (x, t, b, c, d) {
	return -c *(t/=d)*(t-2) + b;
};

Tween.easeInOutQuad = function (x, t, b, c, d) {
	if ((t/=d/2) < 1) return c/2*t*t + b;
	return -c/2 * ((--t)*(t-2) - 1) + b;
};

Tween.easeInCubic = function (x, t, b, c, d) {
	return c*(t/=d)*t*t + b;
};

Tween.easeOutCubic = function (x, t, b, c, d) {
	return c*((t=t/d-1)*t*t + 1) + b;
};

Tween.easeInOutCubic = function (x, t, b, c, d) {
	if ((t/=d/2) < 1) return c/2*t*t*t + b;
	return c/2*((t-=2)*t*t + 2) + b;
};

Tween.easeInQuart = function (x, t, b, c, d) {
	return c*(t/=d)*t*t*t + b;
};

Tween.easeOutQuart = function (x, t, b, c, d) {
	return -c * ((t=t/d-1)*t*t*t - 1) + b;
};

Tween.easeInOutQuart = function (x, t, b, c, d) {
	if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
	return -c/2 * ((t-=2)*t*t*t - 2) + b;
};

Tween.easeInQuint = function (x, t, b, c, d) {
	return c*(t/=d)*t*t*t*t + b;
};

Tween.easeOutQuint = function (x, t, b, c, d) {
	return c*((t=t/d-1)*t*t*t*t + 1) + b;
};

Tween.easeInOutQuint = function (x, t, b, c, d) {
	if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
	return c/2*((t-=2)*t*t*t*t + 2) + b;
};

Tween.easeInSine = function (x, t, b, c, d) {
	return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
};

Tween.easeOutSine = function (x, t, b, c, d) {
	return c * Math.sin(t/d * (Math.PI/2)) + b;
};

Tween.easeInOutSine = function (x, t, b, c, d) {
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};

Tween.easeInExpo = function (x, t, b, c, d) {
	return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
};

Tween.easeOutExpo = function (x, t, b, c, d) {
	return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
};

Tween.easeInOutExpo = function (x, t, b, c, d) {
	if (t==0) return b;
	if (t==d) return b+c;
	if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
	return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
};

Tween.easeInCirc = function (x, t, b, c, d) {
	return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
};

Tween.easeOutCirc = function (x, t, b, c, d) {
	return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
};

Tween.easeInOutCirc = function (x, t, b, c, d) {
	if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
	return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
};

Tween.easeInElastic = function (x, t, b, c, d) {
	var s=1.70158;var p=0;var a=c;
	if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	if (a < Math.abs(c)) { a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
};

Tween.easeOutElastic = function (x, t, b, c, d) {
	var s=1.70158;var p=0;var a=c;
	if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	if (a < Math.abs(c)) { a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};

Tween.easeInOutElastic = function (x, t, b, c, d) {
	var s=1.70158;var p=0;var a=c;
	if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
	if (a < Math.abs(c)) { a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
};

Tween.easeInBack = function (x, t, b, c, d, s) {
	if (s == undefined) s = 1.70158;
	return c*(t/=d)*t*((s+1)*t - s) + b;
};

Tween.easeOutBack = function (x, t, b, c, d, s) {
	if (s == undefined) s = 1.70158;
	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
};

Tween.easeInOutBack = function (x, t, b, c, d, s) {
	if (s == undefined) s = 1.70158;
	if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
};

Tween.easeInBounce = function (x, t, b, c, d) {
	return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
};

Tween.easeOutBounce = function (x, t, b, c, d) {
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
};

Tween.easeInOutBounce = function (x, t, b, c, d) {
	if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
	return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
};

var proto = Tween.prototype;

Object.defineProperty(proto, 'value', {
	enumerable: true,
	get: function () {
		var b = this.startValue;
		var c = this.endValue - this.startValue;
		var d = this.time / this.duration;

		return this.options.easeFunc ? this.options.easeFunc(null, d, b, c, 1) : this.curValue;
	},
});

proto.tick = function (dt) {
	var delta;

	this.time = Math.min(this.time + dt, this.duration);
	delta = this.time / this.duration;
	this.curValue = this.startValue + delta * (this.endValue - this.startValue);

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
