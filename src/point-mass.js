/**
 * @depend tetragon.js
 * @depend vector.js
 */

(function (T) {
'use strict';

/**
 * Defines a point mass
 *
 * The point is initialized with an initial `position` and a `mass`
 * More mass means more inertness
 */
var PointMass = T.PointMass = function (position, mass) {
	// current position
	this.p = position.copy();

	// previous position
	this.pp = position.copy();

	// acceleration for current frame
	this.a = new T.Vector(); // null vector

	// mass; set to 1.0 if not defined
	this.mass = mass || 1.0;

	// set default damping value
	this.damping = 0.997;

	// `true` if pinned to current position
	this.pinned = false;
};

var proto = PointMass.prototype;

/**
 * Move point to next position
 */
proto.inertia = function(dt) {
	// time depending factor used for acceleration
	// dtf = 0.5 * dt^2
	var dtf = 0.5 * dt * dt;

	// get velocity vector and add damping
	// v = (p - pp) * damping
	var v = this.p.sub(this.pp).mult(this.damping);

	// calculate next position by adding velocity
	// and acceleration to current position
	// n = p + v + a * dtf
	var n = this.p.add(v.add(this.a.mult(dtf)));

	// set previous position to current position
	this.pp = this.p.copy();

	// set current position to next position
	this.p = n;

	// clear acceleration for current step
	this.a = new T.Vector();
};

/**
 * Add force vector
 */
proto.applyForce = function(force) {
	// add force multiplied with inverse of mass
	// a += force * (1.0 / mass)
	this.a = this.a.add(force.mult(1.0 / this.mass));
};

/**
 * Pin point to its current position
 */
proto.pin = function() {
	this.pp     = this.p.copy();
	this.pinned = true;
};

}(Tetragon));
