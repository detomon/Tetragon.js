/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

var Matrix = T.Matrix = function (values) {
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

proto.multVec = function (vec) {
	return new T.Vector(
		this[0] * vec.x + this[2] * vec.y + this[4],
		this[1] * vec.x + this[3] * vec.y + this[5]
	);
};

proto.multiply = function (mat) {
	return new Matrix([
		this[0] * mat[0] + this[2] * mat[1],
		this[1] * mat[0] + this[3] * mat[1],
		this[0] * mat[2] + this[2] * mat[3],
		this[1] * mat[2] + this[3] * mat[3],
		this[0] * mat[4] + this[2] * mat[5] + this[4],
		this[1] * mat[4] + this[3] * mat[5] + this[5]
	]);
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
	var mat = new T.Matrix();

	mat[0] = this[0];
	mat[1] = this[1];
	mat[2] = this[2];
	mat[3] = this[3];
	mat[4] = this[4];
	mat[5] = this[5];

	return mat;
};

proto.setContextTransform = function (ctx) {
	ctx.setTransform(this[0], this[1], this[2], this[3], this[4], this[5]);
};

}(Tetragon));
