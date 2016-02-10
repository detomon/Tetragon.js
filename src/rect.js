/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

var Rect = T.Rect = function (p, s) {
	this.pos  = p ? p.copy() : new T.Vector();
	this.size = s ? s.copy() : new T.Vector();
};

var proto = Rect.prototype;

Object.defineProperty(proto, 'maxPos', {
	enumerable: true,
	get: function () {
		return this.pos.add(this.size);
	},
	set: function (maxPos) {
		this.size = maxPos.sub(this.size);
	}
});

Object.defineProperty(proto, 'center', {
	enumerable: true,
	get: function () {
		return this.pos.add(this.size.mult(0.5));
	},
	set: function (center) {
		this.pos = center.sub(this.size.mult(0.5));
	}
});

proto.containsPoint = function (point) {
	var pos = this.pos;
	var maxPos = this.maxPos;

	if (point.x >= pos.x && point.x < maxPos.x) {
		if (point.y >= pos.y && point.y < maxPos.y) {
			return true;
		}
	}

	return false;
};

proto.containsRect = function (rect) {
	var pos = this.pos;
	var maxPos = this.maxPos;
	var rectPos = rect.pos;
	var rectMaxPos = rect.maxPos;

	if (rectPos.x >= pos.x && rectMaxPos.x < maxPos.x) {
		if (rectPos.y >= pos.y && rectMaxPos.y < maxPos.y) {
			return true;
		}
	}

	return false;
};

proto.intersectsWithRect = function (rect) {
	var pos = this.pos;
	var maxPos = this.maxPos;
	var rectPos = rect.pos;
	var rectMaxPos = rect.maxPos;

	if (rectMaxPos.x > pos.x && rectPos.x < maxPos.x) {
		if (rectMaxPos.y > pos.y && rectPos.y < maxPos.y) {
			return true;
		}
	}

	return false;
};

proto.copy = function () {
	return new Rect(this.pos.copy(), this.size.copy());
};

}(Tetragon));
