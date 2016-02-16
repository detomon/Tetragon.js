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
