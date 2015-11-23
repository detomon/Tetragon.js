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
