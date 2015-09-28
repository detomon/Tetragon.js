(function (T) {
'use strict';

var canvas = document.getElementById('canvas');

var r  = 50;
var a  = 0;
var ad = 90 / 180 * Math.PI;

var controller = new T.Canvas({
	element: canvas,
	tick: function (dt, info) {
		a += ad * dt;
		a %= Math.PI * 2;
	},
	draw: function (ctx, info) {
		var viewport = info.viewport.size;
		var x = Math.cos(a) * r + viewport.x * 0.5;
		var y = Math.sin(a) * r + viewport.y * 0.5;

		ctx.fillRect(x, y, 20, 20);
	}
});

controller.startAnimating();

}(Tetragon));
