/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

/**
 * Defines a constraint between two point masses
 *
 * Keeps the points `p1` and `p1` at a given resting distance `restDist`
 * A `stiffness` value of 1.0 sets the maximum responsiveness
 * Values below 1.0 and above 0.0 make the constraint more "rubbery"
 *
 * If `restDist` is omitted, it is set to the initial distance
 *   between `p1` and `p2`
 * If `stiffness` is omitted, it is set to its maximum value 1.0
 */
var Constraint = T.Constraint = function (p1, p2, restDist, stiffness) {
	// set current distance as resting distance if not defined
	if (restDist === undefined) {
		restDist = p2.p.sub(p1.p).length;
	}

	// set default stiffness to maximum if not defined
	if (stiffness === undefined) {
		stiffness = 1.0;
	}

	// set controlling points
	this.p1 = p1;
	this.p2 = p2;

	// set resting distance
	this.restDist = restDist;

	// set stiffness
	this.stiffness = stiffness;
}

var proto = Constraint.prototype;

/**
 * Solve step
 */
proto.solve = function() {
	var p1 = this.p1;
	var p2 = this.p2;

	// current distance vector between points
	// d = p1 - p2
	var d = p1.p.sub(p2.p);

	// scalar distance between points
	// l = |d|
	var l = d.length;

	var r = 0.0;

	// proportion between current distance and resting distance
	if (l != 0.0) {
		r = (this.restDist - l) / l;
	}

	// distance vector differing from resting distance
	// d *= r
	d = d.mult(r);

	// mass influence of `p1` as fraction between 0.0 and 1.0
	// `0.5` would mean that `p1` and `p2` have the same mass
	var f1 = 1.0 - p1.mass / (p1.mass + p2.mass);

	// influences of `p1` and `p2`
	var s1 = f1 * this.stiffness;
	var s2 = this.stiffness - s1;

	if (!p1.pinned) {
		// p1 += d * s1
		p1.p = p1.p.add(d.mult(s1));
	}

	if (!p2.pinned) {
		// p2 -= d * s2
		p2.p = p2.p.sub(d.mult(s2));
	}
};

}(Tetragon));
