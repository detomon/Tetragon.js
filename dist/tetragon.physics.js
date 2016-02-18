(function (w) {
'use strict';

w.Tetragon = w.Tetragon || {
	version: '0.1.5',
};

}(window));

/**
 * @depend tetragon.js
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

	// inverse mass
	if (this.mass == 0.0) {
		this.invMass = Number.MAX_VALUE;
	}
	else if (this.mass == Number.MAX_VALUE) {
		this.invMass = 0.0;
	}
	else {
		this.invMass = 1.0 / this.mass;
	}

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

	// this is more accurate, but also slower
	// v = (p - pp) * damping ^ dt
	//var v = this.p.sub(this.pp).mult(Math.pow(this.damping, dt));

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
	this.a = this.a.add(force.mult(this.invMass));
};

/**
 * Pin point to its current position
 */
proto.pin = function() {
	this.pp     = this.p.copy();
	this.pinned = true;
};

}(Tetragon));

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

/**
 * @depend tetragon.js
 */

(function (T) {
'use strict';

var QuadTree = T.QuadTree = function (rect) {
	this.quads = [];
	this.quadFlags = 0;
	this.items = [];
	this.rect = rect.copy();
};

var Quad = QuadTree.Quad = function (parent, idx, rect) {
	this.parent = parent;
	this.idx = idx;
	this.quads = [];
	this.quadFlags = 0;
	this.items = [];
	this.rect = rect.copy();
};

var Item = QuadTree.Item = function (item, rect) {
	this.quad = null;
	this.item = item;
	this.rect = rect.copy();
};

Item.prototype.remove = function () {
	var idx;
	var parent;
	var quad = this.quad;

	idx = quad.items.indexOf(this);
	quad.items.splice(idx, 1);

	for (; quad; quad = parent) {
		parent = quad.parent;

		if (parent && !quad.items.length && !quad.quadFlags) {
			delete parent.quads[quad.idx];
			parent.quadFlags &= ~(1 << quad.idx);
		}
	}
};

Item.prototype.move = function (rect) {
	throw 'unimplemented method move';
};

QuadTree.prototype.addItem = function (item, rect) {
	var index;
	var quad = this;
	var item = new Item(item, rect);
	var center;

	while (quad) {
		center = quad.rect.center;

		if (!quad.items.length) {
			item.quad = quad;
			quad.items.push(item);
			break;
		}
		else if (quad.rect.contains(rect)) {
			if (rect.pos.x + rect.size.x < center.x) {
				index = 0;
			}
			else if (rect.pos.x >= center.x) {
				index = 2;
			}
			else {
				item.quad = quad;
				quad.items.push(item);
				break;
			}

			if (rect.pos.y + rect.size.y < center.y) {
				index += 0;
			}
			else if (rect.pos.y >= center.y) {
				index += 1;
			}
			else {
				item.quad = quad;
				quad.items.push(item);
				break;
			}
		}
		else {
			item.quad = quad;
			quad.items.push(item);
			break;
		}

		if (!quad.quads[index]) {
			var quadRect = quad.rect.copy();

			quadRect.size.x *= 0.5;
			quadRect.size.y *= 0.5;

			switch (index) {
				case 0: {
					break;
				}
				case 1: {
					quadRect.pos.y += quadRect.size.y;
					break;
				}
				case 2: {
					quadRect.pos.x += quadRect.size.x;
					break;
				}
				case 3: {
					quadRect.pos.x += quadRect.size.x;
					quadRect.pos.y += quadRect.size.y;
					break;
				}
			}

			quad.quads[index] = new Quad(quad, index, quadRect);
			quad.quadFlags |= (1 << index);
		}

		quad = quad.quads[index];
	}

	return item;
};

QuadTree.prototype.forEachItemInRect = function (callback, rect, quad) {
	var i;

	quad = quad || this;

	for (i = 0; i < quad.items.length; i ++) {
		var item = quad.items[i];

		if (rect.intersects(item.rect)) {
			callback(item.item, item);
		}
	}

	for (i = 0; i < quad.quads.length; i ++) {
		var subquad = quad.quads[i];

		if (subquad && rect.intersects(subquad.rect)) {
			this.forEachItemInRect(callback, rect, subquad);
		}
	}
};

}(Tetragon));
