const crypto = require("crypto");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const helmet = require("helmet");
const compression = require("compression");

app.use(express.static("public"));
app.use(compression());
app.use(helmet());

var maze = [
	[1, 4, 0, 0, 0, 0, 0, 0, 3, 6],
	[0, 5, 4, 0, 0, 0, 0, 0, 2, 0],
	[0, 0, 2, 0, 0, 0, 0, 3, 6, 0],
	[0, 0, 2, 0, 0, 0, 0, 2, 0, 0],
	[0, 0, 5, 1, 4, 0, 3, 1, 4, 0],
	[0, 0, 0, 0, 2, 0, 0, 0, 2, 0],
	[0, 0, 3, 8, 1, 4, 0, 0, 2, 0],
	[0, 0, 2, 0, 0, 5, 1, 1, 6, 0],
	[3, 1, 6, 0, 0, 0, 0, 0, 0, 0],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0]

];

/*class Room
{
	constructor ()
	{
		this.ready_cbs = new Array();
	}

	on_ready(event, cb)
	{
		this.ready_cbs.push(cb);
	}

	emit_ready()
	{
		this.ready_cbs
	}
}*/

app.use("/config.js", function (req, res, next) {
	res.set("Content-Type", "application/javascript");
	res.type("application/javascript");
	res.send(`const PUBLIC = "${process.env.PROD ? "https://bcmaze.serverless.social" : "http://localhost:8700"}"; const WS_URL = "${process.env.PROD ? "https://bcmaze.serverless.social" : "http://localhost:8700"}";`);
});

var rooms = new Array();

function add_to_room(player, socket, room)
{
	rooms[room].push(player);
	socket.join(room.toString());
	io.in(room.toString()).emit("r", rooms[room]);
}

function assign_room(player, socket)
{
	var new_room = new Array();
	var void_room = rooms.findIndex(function (room) {
		return !room[1] && room[0] != player;
	});
	if (void_room != -1)
	{
		add_to_room(player, socket, void_room);
		new_room = void_room;
	} else
	{
		new_room = rooms.push(new Array()) - 1;
		add_to_room(player, socket, new_room);
	}
	return new_room;
}

io.on("connection", function (socket) {
	console.log("Connection received.");
	var player = new String();
	var secret = new String();
	var room = new Number();
	var hx = 0;
	var hy = 0;
	crypto.randomBytes(8, function (err, buff) {
		player = buff.toString("hex");
		crypto.randomBytes(16, function (err, buff) {
			secret = buff.toString("hex");
			socket.emit("l", {
				"maze": maze,
				"id": player,
				"secret": secret
			});
			room = assign_room(player, socket);
		});
	});
	socket.on("disconnect", function () {
		console.log("User disconnect.");
		rooms.splice(room, 1);
		io.in(room.toString()).emit("x");
		room = assign_room(player, socket);
	});
	socket.on("m", function (data) {
		console.log(data);
		switch (data)
		{
			case "w":
				if (rooms[room][1])
				{
					var tmp = maze[hy - 1];
					if (tmp && tmp[hx] != 0 && tmp[hx] < 6)
					{
						io.in(room.toString()).emit("m", {
							"m": "w",
							"id": player
						});
						hy -= 1;
					}
				}
			break;
			case "a":
				if (rooms[room][1])
				{
					var tmp = maze[hy][hx - 1];
					if (tmp && tmp != 0 && tmp < 7)
					{
						io.in(room.toString()).emit("m", {
							"m": "a",
							"id": player
						});
						hx -= 1;
					}
				}
			break;
			case "s":
				if (rooms[room][1])
				{
					var tmp = maze[hy + 1];
					if (tmp && tmp[hx] != 0 && tmp[hx] < 7)
					{
						io.in(room.toString()).emit("m", {
							"m": "s",
							"id": player
						});
						hy += 1;
					}
				}
			break;
			case "d":
				if (rooms[room][1])
				{
					var tmp = maze[hy][hx + 1];
					if (tmp && tmp != 0 && tmp < 7)
					{
						io.in(room.toString()).emit("m", {
							"m": "d",
							"id": player
						});
						hx += 1;
					}
				}
			break;
		}
	});
	socket.on("p", function (data) {
		io.emit("p", player);
	});
	/* More handlers */
});

http.listen(process.env.PORT || 8700, function () {
	console.log(`Sever listening on http://localhost:${process.env.PORT || 8700}.`);
});
