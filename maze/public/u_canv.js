class uChar
{
	constructor(src, sprites)
	{
		this.image = new Image();
		this.image.src = src;
		this.sprites = sprites;
		this.ready = false;
		if (Object.keys(sprites).length <= 0)
		{
			throw "uCanv error: you must specify at least 1 sprite.";
		}
		this.sprite = Object.keys(sprites)[0];
		var t = this;
		this.image.addEventListener("load", function (event) {
			t.ready = true;
		});
	}

	changeSprite(sprite)
	{
		if (sprite in this.sprites)
		{
			this.sprite = sprite;
		}
	}

	drawSprite(sprite, dy, dx, dWidth, dHeigth)
	{
		if (!uCanv.ctx)
		{
			throw "uCanv error: You must set a 2D context.";
		}
		uCanv.ctx.drawImage(this.image, this.sprites[sprite].sx, this.sprites[sprite].sy, this.sprites[sprite].sWidth, this.sprites[sprite].sHeigth, dx, dy, dWidth || this.sprites[sprite].sWidth, dHeigth || this.sprites[sprite].sHeigth);
	}

	draw(dy, dx, dWidth, dHeigth)
	{
		this.drawSprite(this.sprite, dx, dy, dWidth, dHeigth);
	}
}

class uElement
{
	constructor (x, y, char, id, parent, w, h)
	{
		this.childs = new Array();
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.id = id;
		if (char instanceof uChar)
		{
			this.char = char;
		}
		if (parent instanceof uElement)
		{
			parent.addChild(this);
		}
	}

	addChild(child)
	{
		if (child instanceof uElement && child.id)
		{
			var index = this.childs.push(child) - 1;
			this.childs[index].parent = this;
			this.childs[index].x += this.x;
			this.childs[index].y += this.y;
		}
	}

	getChild(id)
	{
		return this.childs.findIndex(function (child) {
			return child.id == id;
		});
	}

	removeChild(id)
	{
		var index = this.childs.findIndex(function (child) {
			return child.id == id;
		});
		if (index)
		{
			this.childs.splice(index, 1);
		}
	}

	move(x, y)
	{
		var t = this;
		this.childs.forEach(function (child) {
			child.x -= t.x;
			child.y -= t.y;
			child.x += t.x;
			child.y += t.y;
		});
		t.x = x;
		t.y = y;
	}

	draw()
	{
		this.char.draw(this.x, this.y, this.w, this.h);
		this.childs.forEach(function (child) {
			child.draw();
		});
	}
}

var uCanv = new Object();

