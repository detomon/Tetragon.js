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
		this.pos = maxPos.sub(this.size);
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

proto.contains = function (val) {
	var pos = this.pos;
	var maxPos = this.maxPos;

	if (T.Vector.prototype.isPrototypeOf(val)) {
		if (val.x >= pos.x && val.x < maxPos.x) {
			if (val.y >= pos.y && val.y < maxPos.y) {
				return true;
			}
		}
	}
	else if (T.Rect.prototype.isPrototypeOf(val)) {
		var rectPos = val.pos;
		var rectMaxPos = val.maxPos;

		if (rectPos.x >= pos.x && rectMaxPos.x <= maxPos.x) {
			if (rectPos.y >= pos.y && rectMaxPos.y <= maxPos.y) {
				return true;
			}
		}
	}

	return false;
};

proto.intersects = function (rect) {
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

proto.extend = function (val) {
	var maxPos = this.maxPos;

	if (T.Vector.prototype.isPrototypeOf(val)) {
		if (val.x < this.pos.x) {
			this.pos.x = val.x;
			this.size.x = maxPos.x - val.x;
		}
		else if (val.x > maxPos.x) {
			this.size.x = val.x - this.pos.x;
		}

		if (val.y < this.pos.y) {
			this.pos.y = val.y;
			this.size.y = maxPos.y - val.y;
		}
		else if (val.y > maxPos.y) {
			this.size.y = maxPos.y - this.pos.y;
		}
	}
	else if (T.Rect.prototype.isPrototypeOf(val)) {
		if (val.pos.x < this.pos.x) {
			this.pos.x = val.pos.x;
			this.size.x = maxPos.x - val.pos.x;
		}
		else if (val.maxPos.x > maxPos.x) {
			this.size.x = val.maxPos.x - this.pos.x;
		}

		if (val.pos.y < this.pos.y) {
			this.pos.y = val.pos.y;
			this.size.y = maxPos.y - val.pos.y;
		}
		else if (val.maxPos.y > maxPos.y) {
			this.size.y = val.maxPos.y - this.pos.y;
		}
	}
};

proto.copy = function () {
	return new Rect(this.pos, this.size);
};

}(Tetragon));
