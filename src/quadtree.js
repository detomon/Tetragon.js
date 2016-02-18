/**
 * @depend tetragon.js
 * @depend rect.js
 */

(function (T) {
'use strict';

var QuadTree = T.QuadTree = function (rect) {
	Quad.call(this, rect);
};

var Quad = QuadTree.Quad = function (rect, parent, idx) {
	this.parent = parent;
	this.idx = idx;
	this.quads = [];
	this.quadFlags = 0;
	this.items = [];
	this.rect = new T.Rect(rect);
};

Quad.prototype.addItem = function (object, rect, item) {
	var index;
	var quad = this;
	var center;

	if (!item) {
		item = new Item(object, rect);
	}

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

			quad.quads[index] = new Quad(quadRect, quad, index);
			quad.quadFlags |= (1 << index);
		}

		quad = quad.quads[index];
	}

	return item;
};

Quad.prototype.forEachItemInRect = function (callback, rect) {
	var i;
	var quad = this;

	for (i = 0; i < quad.items.length; i ++) {
		var item = quad.items[i];

		if (rect.intersects(item.rect)) {
			callback(item.item, item);
		}
	}

	for (i = 0; i < quad.quads.length; i ++) {
		var subquad = quad.quads[i];

		if (subquad && rect.intersects(subquad.rect)) {
			subquad.forEachItemInRect(callback, rect);
		}
	}
};

QuadTree.prototype = new Quad();

var Item = QuadTree.Item = function (item, rect) {
	this.quad = null;
	this.item = item;
	this.rect = rect.copy();
};

Item.prototype.remove = function (toQuad) {
	var idx;
	var parent;
	var quad = this.quad;

	idx = quad.items.indexOf(this);
	quad.items.splice(idx, 1);

	for (; quad; quad = parent) {
		if (quad == toQuad) {
			break;
		}

		parent = quad.parent;

		if (parent && !quad.items.length && !quad.quadFlags) {
			delete parent.quads[quad.idx];
			parent.quadFlags &= ~(1 << quad.idx);
		}
	}
};

Item.prototype.move = function (rect) {
	var quad = this.quad;

	// search lowest quad containing new rect
	while (quad.parent) {
		if (quad.rect.contains(rect)) {
			break;
		}

		quad = quad.parent;
	}

	this.rect = new T.Rect(rect);

	// remove from current quad but do not remove new quad
	this.remove(quad);
	quad.addItem(null, rect, this);
};

}(Tetragon));
