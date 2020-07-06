var maze = new Array();

var socket = io(WS_URL || "http://localhost:8700", {
	autoConnect: true,
    transports: ["websocket"]
});

var spritesheet = {
	"pipe_vertical": {
		"sx": 0,
		"sy": 0,
		"sWidth": 95,
		"sHeigth": 119
	},
	"pipe_horizontal": {
		"sx": 95,
		"sy": 0,
		"sWidth": 95,
		"sHeigth": 119
	},
	"hamster_front": {
		"sx": 190,
		"sy": 0,
		"sWidth": 95,
		"sHeigth": 119
	},
	"hamster_back": {
		"sx": 285,
		"sy": 0,
		"sWidth": 95,
		"sHeigth": 119
	},
	"hamster_left": {
		"sx": 0,
		"sy": 119,
		"sWidth": 95,
		"sHeigth": 119
	},
	"hamster_right": {
		"sx": 95,
		"sy": 119,
		"sWidth": 95,
		"sHeigth": 119
	},
	"pipe_corner_1": {
		"sx": 190,
		"sy": 119,
		"sWidth": 95,
		"sHeigth": 119
	},
	"pipe_corner_2": {
		"sx": 285,
		"sy": 119,
		"sWidth": 95,
		"sHeigth": 119
	},
	"pipe_corner_3": {
		"sx": 0,
		"sy": 238,
		"sWidth": 95,
		"sHeigth": 119
	},
	"pipe_corner_4": {
		"sx": 95,
		"sy": 238,
		"sWidth": 95,
		"sHeigth": 119
	}
};

var hamster_char = new uChar("sprites.png", spritesheet);
var hamster = new uElement(0, 59.5 / 2.5, hamster_char, "hamster");
var friend_char = new uChar("sprites.png", spritesheet);
var friend = new uElement(0, 59.5 / 2.5, friend_char, "friend");
var mask = document.getElementById("mask").getContext("2d");
var map = ["pipe_horizontal", "pipe_vertical", "pipe_corner_1", "pipe_corner_2", "pipe_corner_3", "pipe_corner_4"];
var player = new String();
var secret = new String();
var hx = 0;
var hy = 0;
var room = new Array();
var fx = 0;
var fy = 0;
hamster.w = 47.5;
hamster.h = 59.5;
hamster.char.changeSprite("hamster_front");
friend.w = 47.5;
friend.h = 59.5;
friend.char.changeSprite("hamster_front");

function main()
{
	socket.on("l", function (data) {
		player = data.id;
		maze = data.maze;
		secret = data.secret;
	});
	uCanv.ctx = document.getElementById("canvas").getContext("2d");
	loop();
}

function loop()
{
	uCanv.ctx.globalAlpha = 1;
	uCanv.ctx.clearRect(0, 0, 595, 595);
	uCanv.ctx.fillRect(0, 0, 595, 595);
	var x = 0;
	var y = 0;
	maze.forEach(function (row) {
		row.forEach(function (column) {
			if (column != 0 && column <= 7)
			{
				var pipe_char = new uChar("sprites.png", spritesheet);
				var pipe = new uElement(x * 47.5, y * (59.5 / 2.5) + 59.5, pipe_char);
				pipe.char.changeSprite(map[column - 1]);
				pipe.w = 47.5;
				pipe.h = 59.5;
				pipe.draw();
			} else if (column != 0 && column > 7)
			{
				uCanv.ctx.globalAlpha = 0.5;
				var pipe_char = new uChar("sprites.png", spritesheet);
				var pipe = new uElement(x * 47.5, y * (59.5 / 2.5) + 59.5, pipe_char);
				pipe.char.changeSprite(map[column - 8]);
				pipe.w = 47.5;
				pipe.h = 59.5;
				pipe.draw();
				uCanv.ctx.globalAlpha = 1;
			}
			x += 1;
		});
		x = 0;
		y += 1;
	});
	if (hy > fy)
	{
		friend.draw();
		hamster.draw();
	} else
	{
		hamster.draw();
		friend.draw();
	}
	if (room[1])
	{
		uCanv.ctx.fillStyle = "#0000ff";
		uCanv.ctx.beginPath();
		uCanv.ctx.moveTo(friend.x + friend.w / 2 - 10, friend.y - 10);
		uCanv.ctx.lineTo(friend.x + friend.w / 2, friend.y);
		uCanv.ctx.lineTo(friend.x + friend.w / 2 + 10, friend.y - 10);
		uCanv.ctx.fill();
		uCanv.ctx.fillStyle = "#00ff00";
		uCanv.ctx.beginPath();
		uCanv.ctx.moveTo(hamster.x + hamster.w / 2 - 10, hamster.y - 10);
		uCanv.ctx.lineTo(hamster.x + hamster.w / 2, hamster.y);
		uCanv.ctx.lineTo(hamster.x + hamster.w / 2 + 10, hamster.y - 10);
		uCanv.ctx.fill();
		uCanv.ctx.fillStyle = "#000000";
	}
	//uCanv.ctx.drawImage(document.getElementById("mask"), 0, 0);

	if (!room[1])
	{
		uCanv.ctx.fillStyle = "#ffffff";
		uCanv.ctx.font = "18px sans-serif";
		uCanv.ctx.fillText("Waiting for other player...", 4, 18);
		uCanv.ctx.fillStyle = "#000000";
	}

	requestAnimationFrame(loop);
}

document.addEventListener("keypress", function (event) {
	var k = event.key.toLowerCase();
	//console.log(k);
	if (k == "w")
	{
		var tmp = maze[hy - 1];
		hamster.char.changeSprite("hamster_back");
		if (tmp && tmp[hx] != 0 && tmp[hx] < 6)
		{
			console.log(k);
			socket.emit("m", "w");
		}
	} else if (k == "a")
	{
		var tmp = maze[hy][hx - 1];
		hamster.char.changeSprite("hamster_left");
		if (tmp && tmp != 0 && tmp < 7)
		{
			console.log(k);
			socket.emit("m", "a");
		}
	} else if (k == "s")
	{
		var tmp = maze[hy + 1];
		hamster.char.changeSprite("hamster_front");
		if (tmp && tmp[hx] != 0 && tmp[hx] < 7)
		{
			console.log(k);
			socket.emit("m", "s");
		}
	} else if (k == "d")
	{
		var tmp = maze[hy][hx + 1];
		hamster.char.changeSprite("hamster_right");
		if (tmp && tmp != 0 && tmp < 7)
		{
			console.log(k);
			socket.emit("m", "d");
		}
	}
});

socket.on("m", function (data) {
	switch (data.m)
	{
		case "w":
			if (data.id == player)
			{
				hamster.move(hamster.x, hamster.y - 59.5 / 2.5);
				hy -= 1;
			} else
			{
				friend.move(friend.x, friend.y - 59.5 / 2.5);
				fy -= 1;
			}
		break;
		case "a":
			if (data.id == player)
			{
				hamster.move(hamster.x - 47.5, hamster.y);
				hx -= 1;
			} else
			{
				friend.move(friend.x - 47.5, friend.y);
				fx -= 1;
			}
		break;
		case "s":
			if (data.id == player)
			{
				hamster.move(hamster.x, hamster.y + 59.5 / 2.5);
				hy += 1;
			} else
			{
				friend.move(friend.x, friend.y + 59.5 / 2.5);
				fy += 1;
			}
		case "d":
			if (data.id == player)
			{
				hamster.move(hamster.x + 47.5, hamster.y);
				hx += 1;
			} else
			{
				friend.move(friend.x + 47.5, friend.y);
				fx += 1;
			}
		break;
	}
});

socket.on("r", function (data) {
	room = data;
	hamster.char.changeSprite("hamster_front");
	hx = 0;
	hy = 0;
	hamster.x = 0;
	hamster.y = 59.5 / 2.5;
});

socket.on("x", function () {
	var hamster = new uElement(0, 59.5 / 2.5, hamster_char, "hamster");
	hamster.char.changeSprite("hamster_front");
	room = new Array();
	hx = 0;
	hy = 0;
	hamster.x = 0;
	hamster.y = 59.5 / 2.5;
});

socket.on("disconnect", function () {
	location.href = "/";
});

main();
