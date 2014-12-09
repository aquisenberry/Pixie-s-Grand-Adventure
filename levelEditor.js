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
var currentSprite = 0;

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

function addBlock(scene, imageName, x, y) {
	var img = game.images.get(imageName);
	var gridX = Math.floor(x / blockSize) * blockSize;
	var gridY = Math.floor(y / blockSize) * blockSize;

	var block = new Splat.AnimatedEntity(gridX, gridY, blockSize, img.height, img, 0, 0);
	block.type = imageName;
	scene.blocks.push(block);
	scene.blocks = sortEntities(scene.blocks);
	return block;
}

function containsPoint(entity, x, y) {
	return x >= entity.x && x <= entity.x + entity.width && y >= entity.y && y <= entity.y + entity.height;
}

function findBlockIndex(scene, x, y) {
	for (var i = 0; i < scene.blocks.length; i++) {
		var block = scene.blocks[i];
		if (containsPoint(block, x, y)) {
			return i;
		}
	}
	return -1;
}

function selectSprite(spriteIndex){
	var max = game.images.names.length - 1;
	if(spriteIndex > max){
		spriteIndex = 0;
	}
	if(spriteIndex < 0){
		spriteIndex = max;
	}
	currentSprite = spriteIndex;
	return game.images.names[currentSprite];
}
var currentLevel = 0;


var blockToDraw = selectSprite(currentSprite);


function editLevel(scene) {
	if (game.keyboard.consumePressed("pageup")) {
		console.log("next");
		currentLevel++;
		if (!levels[currentLevel]) {
			levels[currentLevel] = JSON.parse(JSON.stringify(levels[currentLevel-1])); // clone previous level
			levels[currentLevel].name = "Level " + currentLevel;
		}
		game.scenes.switchTo("main");
		return;
	}
	if (game.keyboard.consumePressed("pagedown")) {
		console.log("prev");
		currentLevel--;
		if (currentLevel < 0) {
			currentLevel = 0;
		}
		game.scenes.switchTo("main");
		return;
	}
	if (game.keyboard.consumePressed("x") && !scene.hitGoal) {
		levels[currentLevel] = exportLevel(scene, "Level " + currentLevel);
		console.log("module.exports = " + JSON.stringify(levels, null, 4) + ";");
	}

	scene.camera.vx = 0;
	scene.camera.vy = 0;
	if (game.keyboard.isPressed("w")) {
		scene.camera.adjusted = true;
		scene.camera.vy = -0.5;
	}
	if (game.keyboard.isPressed("s")) {
		scene.camera.adjusted = true;
		scene.camera.vy = 0.5;
	}
	if (game.keyboard.isPressed("a")) {
		scene.camera.adjusted = true;
		scene.camera.vx = -0.5;
	}
	if (game.keyboard.isPressed("d")) {
		scene.camera.adjusted = true;
		scene.camera.vx = 0.5;
	}

	if (game.keyboard.consumePressed("right")) {
		blockToDraw = selectSprite(currentSprite + 1);
	}
	if (game.keyboard.consumePressed("left")) {
		blockToDraw = selectSprite(currentSprite - 1);
	}
	if (!game.mouse.isPressed(0)) {
		return;
	}

	var x = game.mouse.x + scene.camera.x;
	var y = game.mouse.y + scene.camera.y;
	var oldX, oldY;
	var index = findBlockIndex(scene, x, y);
	if (game.keyboard.isPressed("shift")) {
		if (index < 0) {
			return;
		}
		scene.blocks.splice(index, 1);
	} else if (blockToDraw === "spawn" || blockToDraw === "goal" ) {
		var entity = scene[blockToDraw];
		oldX = entity.x;
		oldY = entity.y;
		entity.x = Math.floor(x);
		entity.y = Math.floor(y);
		if (entity.getCollisions(scene.blocks).length > 0) {
			entity.x = oldX;
			entity.y = oldY;
		}
	} else {
		if (index >= 0) {
			if (blockToDraw === scene.blocks[index].type) {
				return;
			} else {
				scene.blocks.splice(index, 1);
			}
		}
		addBlock(scene, blockToDraw, x, y);
	}
}

function exportLevel(scene, name) {
	var blockArray = scene.blocks;

	var level = {
		name: name,
		objects: []
	};

	level.objects = blockArray.map(function(block) {
		return {
			type: block.type,
			x: block.x,
			y: block.y,
		};
	});
	level.objects.push({
		type: "spawn",
		x: scene.spawn.x,
		y: scene.spawn.y,
	});
	level.objects.push({
		type: "goal",
		x: scene.goal.x,
		y: scene.goal.y,
	});

	return level;
}

var debug = false;
var editable = true;
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
	if (game.keyboard.consumePressed("f2")) {
		debug = !debug;
		this.showFrameRate = debug;
	}
	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("main");
	}
		editLevel(this);

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

	if (editable) {
		this.camera.drawAbsolute(context, function() {
			if (blockToDraw === "spawn" || blockToDraw === "goal" ) {
				context.fillStyle = "rgba(100, 100, 100, 0.7)";
				context.font = "30px sans-serif";
				context.fillText(blockToDraw, 34, 50);
			} else {
				var img = game.images.get(blockToDraw);
				context.fillStyle = "rgba(100, 100, 100, 0.3)";
				context.fillRect(20, 20, img.width + 20, img.height + 20);
				context.drawImage(img, 30, 30);
			}
		});
//context = context;
	}
}));

function sortEntities(entities) {
	return entities.sort(function(a, b) {
		return (b.y + b.height) - (a.y + a.height);
	});
}
game.scenes.switchTo("loading"); //going to title scene

