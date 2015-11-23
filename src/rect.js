/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function () {
'use strict';

var Rect = Tetragon.Rect = function (p, s) {
	this.pos  = p ? p.copy() : new Tetragon.Vector();
	this.size = s ? s.copy() : new Tetragon.Vector();
};

Object.defineProperty(Rect.prototype, 'maxPos', {
	enumerable: true,
	get: function () {
		return this.pos.add(this.size);
	},
	set: function (maxPos) {
		this.size = maxPos.sub(this.size);
	}
});

Rect.prototype.intersectsWithRect = function (rect) {
	if (rect.pos.x < this.pos.x + this.size.x && rect.pos.x + rect.size.x > this.pos.x) {
		if (rect.pos.y < this.pos.y + this.size.y && rect.pos.y + rect.size.y > this.pos.y) {
			return true;
		}
	}

	return false;
};

}());
