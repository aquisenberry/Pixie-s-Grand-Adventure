"use strict";

var levels = require("./levels");
var Splat = require("splatjs");
var canvas = document.getElementById("canvas");

var manifest = {
	"images": {
		
		"spawn": "img/mmspawn.png",
		"goal": "img/goal.png",
		"player":"img/mmPlayer.png",
		"brightTile":"img/mmBrightTile.png",
		"trigger": "img/mmTrigger.png",
		"effect": "img/mmEffect.png",
		"darkTile":"img/mmdarkTile.png",
		"gamedevlou": "img/gamedevlou.png",
		"parchment": "img/parchment.png"
	},
	"sounds": {
	},
	"fonts": {
	},
	"animations": {
	}
};


var game = new Splat.Game(canvas, manifest);
var blockSize = 8;

function buildLevel(level, scene) {
	scene.blocks = [];
	for (var i = 0; i < level.objects.length; i++) {
		var obj = level.objects[i];
		if (obj.type === "spawn") {
			scene.spawn.x = obj.x;
			scene.spawn.y = obj.y;
		} else if (obj.type === "goal") {
			scene.goal.x = obj.x;
			scene.goal.y = obj.y;
		} else {
			var img = game.images.get(obj.type);
			var block = new Splat.AnimatedEntity(obj.x, obj.y, blockSize, blockSize, img, 0, 0);
			block.type = obj.type;
			scene.blocks.push(block);
		}
	}
	scene.blocks = sortEntities(scene.blocks);
}




var currentLevel = 0;

var debug = false;
function draw(context, entity, color) {
	entity.draw(context);
	if (!debug) {
		return;
	}
	if (entity.touched >= 0) {
		context.fillStyle = color;
		context.fillRect(entity.x, entity.y, entity.width, entity.height);
	} else {
		context.strokeStyle = color;
		context.strokeRect(entity.x, entity.y, entity.width, entity.height);
	}
}

var currentLevel = 1;

game.scenes.add("title", new Splat.Scene(canvas, function() {
	this.timers.expire = new Splat.Timer(undefined, 2000, function() {
		game.scenes.switchTo("main");
	});
	
	this.timers.expire.start();
}, function() {
}, function(context) {
	context.fillStyle = "#049fc6";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var gdl = game.images.get("gamedevlou");
	context.drawImage(gdl, (canvas.width / 2) - (gdl.width / 2), (canvas.height / 2) - (gdl.height / 2));
}));

game.scenes.add("main", new Splat.Scene(canvas, function() {
	
	this.hitGoal = false;
	this.touched = 0;


	var doorway = game.images.get("spawn");
	this.spawn = new Splat.AnimatedEntity(0, 0, doorway.width, doorway.height, doorway, 0, 0);

	var goal = game.images.get("goal");
	this.goal = new Splat.AnimatedEntity(0, 0, goal.width, goal.height, goal, 0, 0);

	buildLevel(levels[currentLevel], this);

}, function(elapsedMillis) {
	// simulation

	this.spawn.move(elapsedMillis);
	this.goal.move(elapsedMillis);	
	elapsedMillis = elapsedMillis;
	
	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("main");
	}

}, function(context) {
	var gdl = game.images.get("parchment");
	context.drawImage(gdl, (canvas.width / 2) - (gdl.width / 2), (canvas.height / 2) - (gdl.height / 2));

	// draw
	//context.drawImage(game.images.get("background"), 0, -canvas.height);
	//context.drawImage(game.images.get("doorway"), this.spawn.x - 34, this.spawn.y - 32);

	for (var i = 0; i < this.blocks.length; i++) {
		draw(context, this.blocks[i], "red");
	}

	draw(context, this.spawn, "green");
	draw(context, this.goal, "green");
}));

function sortEntities(entities) {
	return entities.sort(function(a, b) {
		return (b.y + b.height) - (a.y + a.height);
	});
}
game.scenes.switchTo("loading"); //going to title scene

