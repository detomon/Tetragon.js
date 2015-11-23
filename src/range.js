(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

var Range = Tetragon.Range = function (start, length) {
	this.start = start || 0;
	this.length = length || 0;

};

Object.defineProperty(Range.prototype, 'end', {
	enumerable: true,
	get: function () {
		return this.start + this.length;
	},
	set: function (end) {
		this.length = end - this.start;
	}
});

Range.prototype.intersectsWithPoint = function (point) {
	return point.x >= this.start && point.y <= this.end;
};

Range.prototype.intersectsWithRange = function (range) {
	return range.start < this.end && range.end > this.start;
};

}());
