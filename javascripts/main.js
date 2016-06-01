var canvas, ctx, w, h, world, planeBody, boxBody, boxShape;
var pogo;
var data = [];
var heightfield = new Object();

var gameOver = false

var av = -0.25

var pause = false;

function play() {
	back()
	document.getElementById("pausebutton").className = 'circlebutton'
	document.getElementById("helpbutton").className = 'circlebutton'
	document.getElementById("settingsbutton").className = 'circlebutton'
			
	document.getElementById("helpbutton").style.display = 'none'
	document.getElementById("settingsbutton").style.display = 'none'
	document.getElementById("mainmenu").style.display = 'none'
	document.getElementById("mainmenu").style.opacity = '0'
	document.getElementById("myCanvas").style.display = 'inline'
	document.getElementById("pausebutton").innerHTML = '<i class="fa fa-pause"></i>'
	document.getElementById("pausebutton").style.display = 'block'
//	document.getElementById("pausebutton").style.opacity = '1'
	document.getElementById("myCanvas").style.opacity = '1'
		
	document.getElementById("gamearea").style.backgroundColor = 'black'
	
	if(!pause) {
		init();
	}
	requestAnimationFrame(animate);
	
	pause = false;
}

function pausegame() {
	if(!pause) {
		pause = true;
	//	document.getElementById("myCanvas").style.display = 'none'
		document.getElementById("myCanvas").style.opacity = '0.3'
		document.getElementById("pausebutton").innerHTML = '<i class="fa fa-play"></i>'
		document.getElementById("helpbutton").style.display = 'inline-block'
		document.getElementById("settingsbutton").style.display = 'inline-block'
		
		document.getElementById("pausebutton").className = 'circlebuttoni'
		document.getElementById("helpbutton").className = 'circlebuttoni'
		document.getElementById("settingsbutton").className = 'circlebuttoni'
	} else {
		play();
	}
//	document.getElementById("pausebutton").style.display = 'none'
}

function mainbpprep() {
	document.getElementById("mainmenu").style.display = 'none'
	document.getElementById("mainmenu").style.opacity = '0'
	document.getElementById("myCanvas").style.display = 'inline'
	document.getElementById("pausebutton").innerHTML = '<i class="fa fa-pause"></i>'
	document.getElementById("pausebutton").style.display = 'block'
//	document.getElementById("pausebutton").style.opacity = '1'
	document.getElementById("myCanvas").style.opacity = '1'
		
	document.getElementById("gamearea").style.backgroundColor = 'black'
	init();
	animate();
	pause = true;
	document.getElementById("myCanvas").style.opacity = '0.3'
	document.getElementById("pausebutton").innerHTML = '<i class="fa fa-play"></i>'
	document.getElementById("helpbutton").style.display = 'inline-block'
	document.getElementById("settingsbutton").style.display = 'inline-block'
	
	document.getElementById("pausebutton").className = 'circlebuttoni'
	document.getElementById("helpbutton").className = 'circlebuttoni'
	document.getElementById("settingsbutton").className = 'circlebuttoni'
}

function help() {
	document.getElementById("helpbutton").style.display = 'none'
	document.getElementById("settingsbutton").style.display = 'none'
		
	document.getElementById("helparea").style.display = 'block'
	document.getElementById("helparea").style.opacity = '1'
}

function help1() {
	mainbpprep()
	help()
}

function settings() {
	document.getElementById("helpbutton").style.display = 'none'
	document.getElementById("settingsbutton").style.display = 'none'
		
	document.getElementById("settings").style.display = 'block'
	document.getElementById("settings").style.opacity = '1'
}

function settings1() {
	mainbpprep()
	settings()
}

function back() {
	document.getElementById("helpbutton").style.display = 'inline-block'
	document.getElementById("settingsbutton").style.display = 'inline-block'
	
	document.getElementById("helparea").style.display = 'none'
	document.getElementById("helparea").style.opacity = '0'
		
	document.getElementById("settings").style.display = 'none'
	document.getElementById("settings").style.opacity = '0'
}

var colorful = true;

function toggleColor() {
	colorful=!colorful;
	document.getElementById("coltoggle").innerHTML = (colorful ? "Disable" : "Enable") + " colors";
}

var colordef = {
		sky: "#4d79ff",
		ground: "#00b300",
		body: "#ed00ed",
		stick: "#ff66ff"
}

var color = {
		sky: "#4d79ff",
		ground: "#00b300",
		body: "#ed00ed",
		stick: "#ff66ff"
}

function updateSky() {
	color.sky = "#" + document.getElementById("skyCP").value
}

function updateGround() {
	color.ground = "#" + document.getElementById("groundCP").value
}

function updateBody() {
	color.body = "#" + document.getElementById("bodyCP").value
}

function updateStick() {
	color.stick = "#" + document.getElementById("stickCP").value
}

function resetcolors() {
	if(!colorful) {
		toggleColor()
	}
	
	document.getElementById("skyCP").jscolor.fromString(colordef.sky.slice(1))
	document.getElementById("groundCP").jscolor.fromString(colordef.ground.slice(1))
	document.getElementById("bodyCP").jscolor.fromString(colordef.body.slice(1))
	document.getElementById("stickCP").jscolor.fromString(colordef.stick.slice(1))
	color.sky=colordef.sky
	color.ground=colordef.ground
	color.body=colordef.body
	color.stick=colordef.stick
}

var numDataPoints = 500;

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

var obstacles = [];

var r = 10

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
		angularVelocity : av,
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
		angularVelocity : av,
		velocity : [ 5, 0 ]
	});
	
	pogo.frame.body.addShape(pogo.frame.shape);
	pogo.stick.body.addShape(pogo.stick.shape);
	
	world.addBody(pogo.frame.body);
	world.addBody(pogo.stick.body);
	
	var stiffness = 350, damping = 0.5, restLength = 0.25

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




//while (true) {
//	playGame();
//}