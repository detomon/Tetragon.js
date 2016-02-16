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
