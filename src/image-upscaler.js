/**
 * @depend tetragon.js
 */

(function (window, document, T) {
'use strict';

var ImageUpscaler = T.ImageUpscaler = function () {
	this.frontBuffer = document.createElement('canvas');
	this.backBuffer = document.createElement('canvas');
	this.frontBuffer.width = 64;
	this.frontBuffer.height = 64;
	this.backBuffer.width = 64;
	this.backBuffer.height = 64;
};

ImageUpscaler.prototype.scale = function (image, scale) {
	var x, y;
	var width = image.width;
	var height = image.height;
	var scaledWidth = width * scale.x;
	var scaledHeight = height * scale.y;

	this.frontBuffer.width = Math.max(scaledWidth, this.frontBuffer.width);
	this.frontBuffer.height = Math.max(scaledHeight, this.frontBuffer.height);
	this.backBuffer.width = this.frontBuffer.width;
	this.backBuffer.height = this.frontBuffer.height;

	var frontCtx = this.frontBuffer.getContext('2d');
	var backCtx = this.backBuffer.getContext('2d');

	for (x = 0; x < width; x ++) {
		frontCtx.drawImage(image, x, 0, 1, height, x * scale.x, 0, 1, height);
	}

	for (y = 0; y < height; y ++) {
		backCtx.drawImage(this.frontBuffer, 0, y, scaledWidth, 1, 0, y * scale.y, scaledWidth, 1);
	}

	var buffer = document.createElement('canvas');
	var bufferCtx = buffer.getContext('2d');

	buffer.width = scaledWidth;
	buffer.height = scaledHeight;

	for (x = 0; x < scale.x; x ++) {
		for (y = 0; y < scale.y; y ++) {
			bufferCtx.drawImage(this.backBuffer, x, y);
		}
	}

	return buffer;
};

}(window, document, Tetragon));
