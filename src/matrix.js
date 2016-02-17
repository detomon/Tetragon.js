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

	var m = this.mult(new T.Matrix([
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
