/**
 * @depend tetragon.js
 */

(function () {
'use strict';

var Vector = Tetragon.Vector = function (x, y) {
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

proto.length = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
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

}());
