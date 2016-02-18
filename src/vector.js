/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var Vector = T.Vector = function (x, y) {
	if (Vector.prototype.isPrototypeOf(x)) {
		this.x = x.x;
		this.y = x.y;
	}
	else {
		this.x = parseFloat(x) || 0.0;
		this.y = parseFloat(y) || 0.0;
	}
};

var proto = Vector.prototype;

Object.defineProperty(proto, 'length', {
	get: function () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
});

Object.defineProperty(proto, 'lengthSquared', {
	get: function () {
		return this.x * this.x + this.y * this.y;
	}
});

Object.defineProperty(proto, 'negated', {
	get: function () {
		return new Vector(-this.x, -this.y);
	}
});

Object.defineProperty(proto, 'rotation', {
	get: function () {
		var a = Math.atan2(this.y, this.x);
		a = a < 0 ? a + 2.0 * Math.PI : a;
		return a / Math.PI * 180.0;
	}
});

Object.defineProperty(proto, 'integ', {
	get: function () {
		return new Vector(Math.floor(this.x), Math.floor(this.y));
	}
});

proto.add = function (vec) {
	return new Vector(this.x + vec.x, this.y + vec.y);
};

proto.sub = function (vec) {
	return new Vector(this.x - vec.x, this.y - vec.y);
};

proto.mult = function (val) {
	if (val === Object(val)) {
		return new Vector(this.x * val.x, this.y * val.y);
	}
	else {
		return new Vector(this.x * val, this.y * val);
	}
};

proto.div = function (val) {
	if (val === Object(val)) {
		return new Vector(this.x / val.x, this.y / val.y);
	}
	else {
		return new Vector(this.x / val, this.y / val);
	}
};

proto.normalize = function (mag) {
	if (mag === undefined) {
		mag = 1.0;
	}

	var len = this.length;

	if (len) {
		len = mag / len;
	}

	return new Vector(this.x * len, this.y * len);
};

proto.dot = function (vec) {
	return this.x * vec.x + this.y * vec.y;
};

proto.rotate = function (a) {
	var r = a / 180.0 * Math.PI;
	var c = Math.cos(r);
	var s = Math.sin(r);

	return new Vector(
		this.x * c - this.y * s,
		this.x * s + this.y * c
	);
};

proto.reflect = function (wall) {
	wall = wall.normalize();
	return this.sub(wall.mult(2.0 * wall.dot(this)));
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
	return new Vector(this.x << n, this.y << n);
};

proto.shr = function (n) {
	return new Vector(this.x >> n, this.y >> n);
};

proto.copy = function (a) {
	return new Vector(this.x, this.y);
};

}(Tetragon));
