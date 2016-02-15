/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

var Range = T.Range = function (location, length) {
	this.location = location || 0;
	this.length = length || 0;
};

var proto = Range.prototype;

Object.defineProperty(proto, 'end', {
	enumerable: true,
	get: function () {
		return this.location + this.length;
	},
	set: function (end) {
		this.location = end - this.length;
	}
});

proto.contains = function (value) {
	if (T.Range.prototype.isPrototypeOf(val)) {
		return value.location >= this.location && value.end <= this.end;
	}
	else {
		return value >= this.location && value < this.end;
	}
};

proto.intersects = function (range) {
	return range.location < this.end && range.end > this.location;
};

proto.extend = function (val) {
	var end = this.end;

	if (Range.prototype.isPrototypeOf(val)) {
		if (val.location < this.location) {
			this.location = val.location;
			this.length = end - this.location;
		}
		else if (val.end > end) {
			this.length = val.end - this.location;
		}
	}
	else {
		if (val < this.location) {
			this.location = val;
			this.length = end - val;
		}
		else if (val > end) {
			this.length = val - location;
		}
	}
};

proto.copy = function () {
	return new Range(this.location, this.length);
};

}(Tetragon));
