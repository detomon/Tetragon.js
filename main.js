(function (T) {
'use strict';

var canvas = document.getElementById('canvas');

var controller = new T.Canvas({
	element: canvas,
	tick: function (dt, info) {

	},
	draw: function (ctx, info) {
		ctx.fillRect(0, 0, 20, 20);
	}
});

controller.startAnimating();

}(Tetragon));
