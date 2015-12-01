/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var Controls = T.Controls = function () {
	this.keys = 0;
};

Controls.LEFT   = 1 << 0;
Controls.TOP    = 1 << 1;
Controls.RIGHT  = 1 << 2;
Controls.BOTTOM = 1 << 3;

Controls.keyMap = {
	37: Controls.LEFT,   // arrow left
	38: Controls.TOP,    // arrow up
	39: Controls.RIGHT,  // arrow right
	40: Controls.BOTTOM, // arrow down

	65: Controls.LEFT,   // A
	87: Controls.TOP,    // W
	68: Controls.RIGHT,  // D
	83: Controls.BOTTOM  // S
};

var proto = Controls.prototype;

proto.pressKeyWithCode = function (keyCode) {
	if (Controls.keyMap[keyCode]) {
		this.keys |= Controls.keyMap[keyCode];
	}
};

proto.releaseKeyWithCode = function (keyCode) {
	if (Controls.keyMap[keyCode]) {
		this.keys &= ~Controls.keyMap[keyCode];
	}
};

proto.isKeyPressed = function (key) {
	return this.keys & key;
};

proto.reset = function () {
	this.keys = 0;
};

}(Tetragon));
