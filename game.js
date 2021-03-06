"use strict";

var levels = require("./levels");
var Splat = require("splatjs");
//var physics = require("./physics")
var canvas = document.getElementById("canvas");

var manifest = {
	"images": {
		
		"spawn": "img/mmspawn.png",
		"goal": "img/goal.png",
		"player":"img/mmPlayer.png",
		"brightTile":"img/mmBrightTile.png",
		"trigger": "img/mmTrigger.png",
		"effect": "img/mmEffect.png",
		"triggerI": "img/mmTrigger_inactive.png",
		"effectI": "img/mmEffect_Inactive.png",
		"triggerA": "img/mmTrigger_Active.png",
		"effectA": "img/mmEffect_active.png",
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
var currentLevel = 0;

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
		} 
		else if (obj.type === "effect-a") {
			scene.effectA.x = obj.x;
			scene.effectA.y = obj.y;
		} 
		else if (obj.type === "effect-b") {
			scene.effectB.x = obj.x;
			scene.effectB.y = obj.y;
		} 
		else if (obj.type === "effect-c") {
			scene.effectC.x = obj.x;
			scene.effectC.y = obj.y;
		} 
		else if (obj.type === "effect-d") {
			scene.effectD.x = obj.x;
			scene.effectD.y = obj.y;
		} 
		else if (obj.type === "effect-e") {
			scene.effectE.x = obj.x;
			scene.effectE.y = obj.y;
		}
		else if (obj.type === "trigger-a") {
			scene.triggerA.x = obj.x;
			scene.triggerA.y = obj.y;
		} 
		else if (obj.type === "trigger-b") {
			scene.triggerB.x = obj.x;
			scene.triggerB.y = obj.y;
		} 
		else if (obj.type === "trigger-c") {
			scene.triggerC.x = obj.x;
			scene.triggerC.y = obj.y;
		} 
		else if (obj.type === "trigger-d") {
			scene.triggerD.x = obj.x;
			scene.triggerD.y = obj.y;
		} 
		else if (obj.type === "trigger-e") {
			scene.triggerE.x = obj.x;
			scene.triggerE.y = obj.y;
		} 
		else if (obj.type === "trigger-f") {
			scene.triggerF.x = obj.x;
			scene.triggerF.y = obj.y;
		}
		/*else if (obj.type === "goal") {
			scene.goal.x = obj.x;
			scene.goal.y = obj.y;
		} */
		else {
			var img = game.images.get(obj.type);
			var block = new Splat.AnimatedEntity(obj.x, obj.y, img.width, img.height, img, 0, 0);
			block.type = obj.type;
			scene.blocks.push(block);
		}
	}
	scene.blocks = sortEntities(scene.blocks);
}
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
var isJumpable = true;
function applyPhysics(object, blocks,time){
	var gravityAccel = 0.003;
	var jumpSpeed = -0.08;
	var moveForce = 0.05;
	//var minJump = -0.3;
	var frictionFactor = 0.8;
	var maxVelocity = 1.0;
	//var oldY = object.x;
	//var oldY = object.y;

	isPlayerAddingForce( object, jumpSpeed, isJumpable, moveForce,maxVelocity);
	applyGravity(object,gravityAccel,frictionFactor,time);
	moveObject(object,time);
	resolveCollisions(object, blocks);
}
function isPlayerAddingForce( object, jumpSpeed, isJumpable,moveForce, mv){
	if (game.keyboard.isPressed("left") && object.vx>-mv){
		object.vx -=moveForce;
	}
	if (game.keyboard.isPressed("right") && object.vx<mv){
		object.vx+=moveForce;
	}
	if (game.keyboard.isPressed("space") && isJumpable){
		object.vy+=jumpSpeed;
		
	}
}
function applyGravity(object, gravity,frictionFactor, time){
	object.vy += gravity*time;
	if(true){//is grounded
		if (object.vx > 0.01){
			//frictionFactor = frictionFactor*-1;
			object.vx =  object.vx *frictionFactor;
		}else if (object.vx < -0.01){
			//frictionFactor = frictionFactor * 1;
			object.vx =  object.vx *frictionFactor;
		}else{
			object.vx = 0;
		}
	}
}
function moveObject(object, time){
	
	object.move(time);
}
///////////////////////////////////////////////////////only set to resolve bottom of screen collision at the moment
function resolveCollisions(object,blocks){
	object.solveCollisions(blocks);
 if (object.y +object.height> 640){
 	object.y = 640-object.height;
 	object.vy = 0;
 	isJumpable = true;
 	//console.log("vx: " + object.vx, "vy: " + object.vy);
 }
 if (object.x < 0){
 	object.x = 1;
 }
}

function checkTriggers(player,triggers){
	for(var i = 0; i<triggers.length;i++){
		var trigger = triggers[i];
		if (!trigger.didCollideWithPlayer && trigger.collides(player)){
			trigger.active = !trigger.active;
			trigger.didCollideWithPlayer = true;
		}
		if (trigger.didCollideWithPlayer && !trigger.collides(player)){
			trigger.didCollideWithPlayer = false;
		}
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

game.scenes.add("main", new Splat.Scene(canvas, function() {//init
	
	this.hitGoal = false;
	this.touched = 0;


	var doorway = game.images.get("spawn");
	this.spawn = new Splat.AnimatedEntity(0, 0, doorway.width, doorway.height, doorway, 0, 0); 
	var triggerInactive = game.images.get("triggerI");
	this.triggerA = new Splat.AnimatedEntity(0, 0, triggerInactive.width, triggerInactive.height, triggerInactive, 0, 0); 
	this.triggerB = new Splat.AnimatedEntity(0, 0, triggerInactive.width, triggerInactive.height, triggerInactive, 0, 0); 
	this.triggerC = new Splat.AnimatedEntity(0, 0, triggerInactive.width, triggerInactive.height, triggerInactive, 0, 0); 
	this.triggerD = new Splat.AnimatedEntity(0, 0, triggerInactive.width, triggerInactive.height, triggerInactive, 0, 0); 
	this.triggerE = new Splat.AnimatedEntity(0, 0, triggerInactive.width, triggerInactive.height, triggerInactive, 0, 0); 
	this.triggerF = new Splat.AnimatedEntity(0, 0, triggerInactive.width, triggerInactive.height, triggerInactive, 0, 0);
	this.triggerA.active = false;
	this.triggerB.active = false;
	this.triggerC.active = false;
	this.triggerD.active = false;
	this.triggerE.active = false;
	this.triggerF.active = false;
	var drawTrigger = function(context){
		var image = game.images.get(this.active?"triggerA":"triggerI");
		context.drawImage(image,this.x,this.y);
	};
	this.triggerA.draw = drawTrigger;
	this.triggerB.draw = drawTrigger;
	this.triggerC.draw = drawTrigger;
	this.triggerD.draw = drawTrigger;
	this.triggerE.draw = drawTrigger;
	this.triggerF.draw = drawTrigger;

	var effectInactive = game.images.get("effectI");
	this.effectA = new Splat.AnimatedEntity(0, 0, effectInactive.width, effectInactive.height, effectInactive, 0, 0); 
	this.effectB = new Splat.AnimatedEntity(0, 0, effectInactive.width, effectInactive.height, effectInactive, 0, 0); 
	this.effectC = new Splat.AnimatedEntity(0, 0, effectInactive.width, effectInactive.height, effectInactive, 0, 0); 
	this.effectD = new Splat.AnimatedEntity(0, 0, effectInactive.width, effectInactive.height, effectInactive, 0, 0); 
	this.effectE = new Splat.AnimatedEntity(0, 0, effectInactive.width, effectInactive.height, effectInactive, 0, 0); 

	var goal = game.images.get("goal");
	this.goal = new Splat.AnimatedEntity(0, 0, goal.width, goal.height, goal, 0, 0);

	buildLevel(levels[currentLevel], this);

	var playerImage = game.images.get("player");
	this.player = new Splat.AnimatedEntity(this.spawn.x + playerImage.width,this.spawn.y - 5,playerImage.width ,playerImage.height, playerImage,0,0);

}, function(elapsedMillis) {
	// simulation
	var me = this.player;

	this.spawn.move(elapsedMillis);
	this.goal.move(elapsedMillis);	
	elapsedMillis = elapsedMillis;
	
	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("main");
	}
	var triggers = [
	this.triggerA,
	this.triggerB,
	this.triggerC,
	this.triggerD,
	this.triggerE,
	this.triggerF];
	applyPhysics(me, this.blocks, elapsedMillis );
	checkTriggers(me,triggers);
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
	draw(context,this.effectA,"green");
	draw(context,this.effectB,"green");
	draw(context,this.effectC,"green");
	draw(context,this.effectD,"green");
	draw(context,this.effectE,"green");
	draw(context,this.triggerA,"green");
	draw(context,this.triggerB,"green");
	draw(context,this.triggerC,"green");
	draw(context,this.triggerD,"green");
	draw(context,this.triggerE,"green");
	draw(context,this.triggerF,"green");
	draw(context, this.player, "green");

}));


function sortEntities(entities) {
	return entities.sort(function(a, b) {
		return (b.y + b.height) - (a.y + a.height);
	});
}
game.scenes.switchTo("loading"); //going to title scene

