var stage = new createjs.Stage("canvas");
var graph = new Array();
var shapes = new Array();
var shape = new Array();
var in_canv = new createjs.Shape();
var point;
var i = 0;
var j = 0;
var z = 0;
var color = "red";
var color_cache = "red";
var colors = document.getElementsByClassName("color");
var color_map = {
	"red": "#ff0000",
	"blue": "#0000ff",
	"green": "#00ff10",
	"black": "#000000",
	"yellow": "#ffaa00",
	"cyan": "#00ffaa",
	"violet": "#aa00ff"
};

function get_dist(pos1, pos2)
{
	var y = pos2.y - pos1.y;
	var x = pos2.x - pos1.x;
	return Math.sqrt(x * x + y * y);
}

document.getElementById("canvas").addEventListener("click", function (event) {
	var tmp = {
		"x": event.offsetX,
		"y": event.offsetY
	};
	if (!shape[0])
	{
		if (color != color_cache)
		{
			color_cache = color;
		}
		point = new createjs.Shape();
		point.graphics.setStrokeStyle(3);
		point.graphics.beginStroke(color_cache);
		point.graphics.moveTo(tmp.x, tmp.y);
		point.graphics.lineTo(tmp.x + 3, tmp.y);
		point.graphics.endStroke();
		stage.addChild(point);
		shape.push(tmp);
		j++;
	} else if (shape[0] && get_dist(shape[0], tmp) > 9)
	{
		var graph = new createjs.Shape();
		stage.removeChild(point);
		graph.graphics.setStrokeStyle(3);
		graph.graphics.beginStroke(color_cache);
		graph.graphics.moveTo(shape[j - 1].x, shape[j - 1].y);
		graph.graphics.lineTo(tmp.x, tmp.y);
		graph.graphics.endStroke();
		shape.push(tmp);
		stage.addChild(graph);
		j++;
	} else if (get_dist(shape[0], tmp) < 9 && shape[1])
	{
		shape.graph = new createjs.Shape();
		var k = 1;
		shape.graph.graphics.beginFill(color_cache);
		shape.graph.graphics.moveTo(shape[0].x, shape[0].y);
		while (k < shape.length)
		{
			shape.graph.graphics.lineTo(shape[k].x, shape[k].y);
			k++;
		}
		shape.graph.graphics.endFill();
		stage.addChild(shape.graph);
		shapes.push(shape);
		shape = new Array();
		j = 0;
	}
});

function loop()
{
	document.getElementById("canvas").getContext("2d").clearRect(0, 0, 640, 480);
	requestAnimationFrame(loop);
}

createjs.Ticker.framerate = 60;
createjs.Ticker.on("tick", stage);

document.getElementById("new").addEventListener("click", function (event) {
	stage.removeAllChildren();
	shape = new Array();
	shapes = new Array();
	point = null;
});

while (z < colors.length)
{
	colors.item(z).addEventListener("click", function (event) {
		color = color_map[event.target.id];
	});
	z++;
}
