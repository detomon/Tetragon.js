(function (T) {
'use strict';

var r = 0;

var canvas = document.getElementById('canvas');

var controller = new T.Canvas({
	element: canvas,
	tick: function (dt, info) {
		// 90° / sec
		r += 90 * (Math.PI / 180) * dt;
	},
	draw: function (ctx, info) {
		var x = Math.cos(r) * 100;
		var y = Math.sin(r) * 100;

		ctx.fillRect(x, y, 10, 10);
	}
});

controller.startAnimating();

}(Tetragon));
