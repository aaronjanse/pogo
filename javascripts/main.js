var gameOver = false
var pendingquit = false
var pause = false;

var score = null

var world, pogo;
var obstacles = [];

var numDataPoints = 500;
var data = [];
var heightfield = new Object();

var angularVelocity = -0.25

var stiffness = 350, damping = 0.5, restLength = 0.25

var r = 10 //obstacle rarity

function init() {
	// Init canvas
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;
	// Init p2.js
	
	noise.seed(Math.random()*10);
	data.push(0)
	
	for (var i = 0; i < numDataPoints; i++) {
		v = i / 10
		
		var value = noise.simplex2(v, 0);
		var value1 = noise.perlin2(v, 0);
		// data.push(0.5*Math.cos(0.2*i) * Math.sin(0.5*i) + 0.6*Math.sin(0.1*i)
		// * Math.sin(0.05*i));
		data.push(value * 1.75)
	}
	
	initgame()
	initControls()
}

function initgame() {
	world = new p2.World({
		gravity : [ 0, -7 ]
	});
	
	world.defaultContactMaterial.friction = 100;
	world.defaultContactMaterial.restitution = 0.1;
	
	pogo = {
		stick : new Object(),
		frame : new Object(),
		spring : null
	};
	
	

	pogo.stick.shape = new p2.Box({
		width : 0.25,
		height : 1
	});
	
	pogo.stick.body = new p2.Body({
		mass : 0.25,
//		damping: 0.2,
		position : [ 0, 2.75],
		angularVelocity : angularVelocity,
		velocity : [ 5, 0 ]
	});
	
	pogo.frame.shape = new p2.Box({
		width : 0.5,
		height : 1.5,
		sensor: true
	});
	
	pogo.frame.body = new p2.Body({
		mass : 3,
		position : [ 0, 3 ],
		angularVelocity : angularVelocity,
		velocity : [ 5, 0 ]
	});
	
	pogo.frame.body.addShape(pogo.frame.shape);
	pogo.stick.body.addShape(pogo.stick.shape);
	
	world.addBody(pogo.frame.body);
	world.addBody(pogo.stick.body);

	var c1 = new p2.PrismaticConstraint(pogo.frame.body, pogo.stick.body, {
		localAnchorA : [ 0, 0.5 ],
		localAnchorB : [ 0, 0.5 ],
		localAxisA : [ 0, 1 ],
		disableRotationalLock : true,
	});
	var c2 = new p2.PrismaticConstraint(pogo.frame.body, pogo.stick.body, {
		localAnchorA : [ 0, 0 ],
		localAnchorB : [ 0, 1 ],
		localAxisA : [ 0, 1 ],
		disableRotationalLock : true,
	});
	 c1.setLimits(-1.25, -0.5);
	world.addConstraint(c2);
	world.addConstraint(c1);
	
	pogo.spring = new p2.LinearSpring(pogo.frame.body, pogo.stick.body, {
		restLength : restLength,
		stiffness : stiffness,
		damping : damping,
		localAnchorA : [ 0, 0 ],
		localAnchorB : [ 0, 0 ],
	});
	
	world.addSpring(pogo.spring);
	
	heightfield.shape = new p2.Heightfield({
		heights : data,
		elementWidth : 2
	});
	heightfield.body = new p2.Body({
		position : [ -1, -1 ]
	});
	heightfield.body.addShape(heightfield.shape);
	world.addBody(heightfield.body);
	
	var OBSTACLE = 8;
	
	obstacles = []
	for(var i = 5; i < 200; i++) {
		if(i%r==0) {
			y = data[i]+Math.random()*5
	        var circleShape = new p2.Circle({ radius: 0.5 });
	        var circleBody = new p2.Body({ mass:1, position:[i*2,y], fixedX: true, fixedY: true});
	        circleBody.addShape(circleShape);
	        circleShape.collisionGroup = OBSTACLE;
	        obstacles.push(circleBody);
	        world.addBody(circleBody);
		}
	}
	
	// Setup Collisions
	var FRAME = 1, STICK = 2, GROUND = 4;
	
	pogo.frame.shape.collisionGroup = FRAME;
	pogo.stick.shape.collisionGroup = STICK;
	heightfield.shape.collisionGroup = GROUND;
	
	pogo.frame.shape.collisionMask = ~STICK;
	pogo.stick.shape.collisionMask = ~FRAME;
	heightfield.shape.collisionMask = -1;
	
	world.on("beginContact",function(event){
		if(event.bodyA == pogo.frame.body || event.bodyB == pogo.frame.body) {
			gameOver = true;
		}
	});
}