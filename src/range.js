/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function () {
'use strict';

var Range = Tetragon.Range = function (start, length) {
	this.start = start || 0;
	this.length = length || 0;

};

var proto = Range.prototype;

Object.defineProperty(proto, 'end', {
	enumerable: true,
	get: function () {
		return this.start + this.length;
	},
	set: function (end) {
		this.length = end - this.start;
	}
});

proto.containsPoint = function (point) {
	return point >= this.start && point < this.end;
};

proto.containsRange = function (range) {
	return range.start >= this.start && range.end <= this.end;
};

proto.intersectsWithRange = function (range) {
	return range.start < this.end && range.end > this.start;
};

}());
