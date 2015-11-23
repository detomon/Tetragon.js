/**
 * Polyfill for window.requestAnimationFrame
 *
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
(function (w) {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for(var x = 0; x < vendors.length && !w.requestAnimationFrame; ++x) {
		w.requestAnimationFrame = w[vendors[x]+'RequestAnimationFrame'];
		w.cancelAnimationFrame =
		  w[vendors[x]+'CancelAnimationFrame'] || w[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!w.requestAnimationFrame)
		w.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = w.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!w.cancelAnimationFrame)
		w.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
}(window));
