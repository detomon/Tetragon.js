(function (T) {
'use strict';

var system = new T.EntitySystem();

system.createComponent({
	name: 'draw',
	draw: function (ctx) {
		var pos = this.entity.componentData('position');

		ctx.fillRect(pos.pos.x, pos.pos.y, 20, 20);
	}
});

system.createComponent({
	name: 'position',
	createInstance: function (position) {
		return {
			pos: position.copy()
		};
	}
});

system.createComponent({
	name: 'pointMass',
	createInstance: function (point, mass) {
		return {
			point: new T.PointMass(point, mass)
		};
	},
	tick: function (dt) {
		this.point.inertia(dt);
		this.entity.componentData('position').pos = this.point.p.copy();
	}
});

system.createComponent({
	name: 'constraint',
	createInstance: function (point1, point2, restDist, stiffness) {
		return {
			constraint: new T.Constraint(point1, point2, restDist, stiffness)
		};
	},
	tick: function (dt) {
		this.constraint.solve();
	}
});

system.createComponent({
	name: 'gravity',
	tick: function (dt) {
		var data = this.entity.componentData('pointMass');
		data.point.applyForce(new T.Vector(0, 1000));
	}
});

var point1 = system.createEntity();
var point2 = system.createEntity();
var constraint = system.createEntity();

point1.addComponent('position', new T.Vector(-200, -200));
var p1 = point1.addComponent('pointMass', new T.Vector(-200, -200));

point2.addComponent('position', new T.Vector(0, -200));
var p2 = point2.addComponent('pointMass', new T.Vector(0, -200));

point1.addComponent('draw');
point2.addComponent('draw');

point1.addComponent('gravity');

constraint.addComponent('constraint', p1.point, p2.point, 100, 0.1);


var canvas = document.getElementById('canvas');

var controller = new T.Canvas({
	element: canvas,
	tick: function (dt, info) {
		system.iterate('gravity', 'tick', dt);
		system.iterate('pointMass', 'tick', dt);
		system.iterate('constraint', 'tick', dt);
	},
	draw: function (ctx, info) {
		system.iterate('draw', 'draw', ctx);
	}
});

controller.startAnimating();

}(Tetragon));
