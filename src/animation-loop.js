/**
 * @depend tetragon.js
 */

(function () {
'use strict';

/**
 * Animation loop
 */
var AnimationLoop = Tetragon.AnimationLoop = function (framerate) {
	this.framerate = framerate;
	this.lastTime  = 0;
}

/**
 * Advance animation loop to new time
 *
 * `tickFunc` is called every frame
 */
AnimationLoop.prototype.advanceToTime = function (time, tickFunc) {
	// set `lastTime` to previous frame if first frame
	if (this.lastTime == 0) {
		this.lastTime = time - 1.0 / 60.0;
	}

	// limit previous time if animation was paused or had a greater lag,
	// the loop will not try to catch up with a too big time step
	this.lastTime = Math.max(time - 1.0 / 20.0, this.lastTime)

	// only advance to previous frame
	time -= this.framerate;

	// advance to new time
	while (this.lastTime < time) {
		tickFunc(this.framerate);
		this.lastTime += this.framerate;
	}
};

}());
