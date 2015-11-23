(function () {
'use strict';

window.Tetragon = window.Tetragon || {};

var Rect = Tetragon.Rect = function (p, s) {
	this.pos  = p ? p.copy() : new Tetragon.Vector();
	this.size = s ? s.copy() : new Tetragon.Vector();
};

Rect.prototype.intersectsWithRect = function (rect) {
	if (rect.pos.x < this.pos.x + this.size.x && rect.pos.x + rect.size.x > this.pos.x) {
		if (rect.pos.y < this.pos.y + this.size.y && rect.pos.y + rect.size.y > this.pos.y) {
			return true;
		}
	}

	return false;
};

}());
