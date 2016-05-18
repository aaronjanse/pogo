var canvas, ctx, w, h, world, planeBody, boxBody, boxShape;
var pogo;
var data = [];
var heightfield = new Object();
init();
requestAnimationFrame(animate);

function init() {
	// Init canvas
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;
	// Init p2.js
	world = new p2.World({
		gravity : [ 0, -7 ]
	});
	
	world.defaultContactMaterial.friction = 100;
	world.defaultContactMaterial.restitution = 0.5*0;
	
	pogo = {
		stick : new Object(),
		frame : new Object(),
		spring : null
	// ,tip: new Object()
	};
	
	// pogo.tip.shape = new p2.Circle({ radius: 0.3 })
	//        
	// pogo.tip.body = new p2.Body({
	// mass: 1,
	// position: [0,2],
	// angularVelocity: -0.5
	// });
	
	var av = -0.25

	pogo.stick.shape = new p2.Box({
		width : 0.25,
		height : 1
	});
	
	pogo.stick.body = new p2.Body({
		mass : 0.5,
//		damping: 0.2,
		position : [ 0, 1 ],
		angularVelocity : av,
		velocity : [ 5, 0 ]
	});
	
	pogo.frame.shape = new p2.Box({
		width : 0.5,
		height : 1.5
	});
	
	pogo.frame.body = new p2.Body({
		mass : 2,
		position : [ 0, 3 ],
		angularVelocity : av,
		velocity : [ 5, 0 ]
	});
	
	pogo.frame.body.addShape(pogo.frame.shape);
	pogo.stick.body.addShape(pogo.stick.shape);
	
	// world.addBody(pogo.tip.body);
	world.addBody(pogo.frame.body);
	world.addBody(pogo.stick.body);
	
	var stiffness = 350, damping = 0.5, restLength = 1

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
	 c1.setLimits(-2, 0.5);
	 c2.setLimits(-2, 0.5);
	world.addConstraint(c2);
	world.addConstraint(c1);
	
	// world.addSpring(new p2.LinearSpring(pogo.frame.body, pogo.stick.body, {
	// restLength : restLength,
	// stiffness : stiffness,
	// damping : damping,
	// localAnchorA : [0,0],
	// localAnchorB : [0,0],
	// }));
	
	pogo.spring = new p2.LinearSpring(pogo.frame.body, pogo.stick.body, {
		restLength : restLength,
		stiffness : stiffness,
		damping : damping,
		localAnchorA : [ 0, 0 ],
		localAnchorB : [ 0, 0 ],
	});
	
	world.addSpring(pogo.spring);
	
	// Add a box
	// boxShape = pogo.frame.shape
	// boxBody = pogo.frame.body
	// boxShape = new p2.Box({
	// width: 0.5,
	// height: 1.5
	// });
	// boxBody = new p2.Body({
	// mass: 1,
	// position: [0,3],
	// angularVelocity: -0.5
	// });
	// boxBody.addShape(boxShape);
	// world.addBody(boxBody);
	// Add a plane
	// planeShape = new p2.Plane();
	// planeBody = new p2.Body();
	// planeBody.addShape(planeShape);
	
	noise.seed(Math.random());
	data.push(0)
	var numDataPoints = 500;
	for (var i = 0; i < numDataPoints; i++) {
		v = i / 10
		var value = noise.simplex2(v, 0);
		var value1 = noise.perlin2(v, 0);
		// data.push(0.5*Math.cos(0.2*i) * Math.sin(0.5*i) + 0.6*Math.sin(0.1*i)
		// * Math.sin(0.05*i));
		data.push(value * 1.75)
	}
	heightfield.shape = new p2.Heightfield({
		heights : data,
		elementWidth : 2
	});
	heightfield.body = new p2.Body({
		position : [ -1, -1 ]
	});
	heightfield.body.addShape(heightfield.shape);
	world.addBody(heightfield.body);
	
	// world.addBody(planeBody);
	
	// Setup Collisions
	var FRAME = 1, STICK = 2, GROUND = 4;
	
	// pogo.tip.shape.collisionGroup = TIP;
	pogo.frame.shape.collisionGroup = FRAME;
	pogo.stick.shape.collisionGroup = STICK;
	heightfield.shape.collisionGroup = GROUND;
	
	// pogo.tip.shape.collisionMask = ~STICK;
	pogo.frame.shape.collisionMask = ~STICK;
	pogo.stick.shape.collisionMask = ~FRAME;
	heightfield.shape.collisionMask = -1;
	
	window.addEventListener("keydown", keydown, false);
	window.addEventListener("keyup", keyup, false);
	window.addEventListener("keypress", keypress, false);
}

function keydown(evt) {
	// t = 5;
	// switch(evt.keyCode){
	// case 39: // right
	// torque = -t;
	// break;
	// case 37: // left
	// torque = t;
	// break;
	// }
	
//	alert(evt.charCode)
	if (evt.keyCode == 65) {
		pogo.spring.restLength = 1.25;
		pogo.spring.applyForce();
	}
	
	if (evt.keyCode == 83) {
		// alert("Hi")
		pogo.frame.body.angularVelocity = +twistval
		// pogo.stick.body.angularVelocity+=twistval
	}
	if (evt.keyCode == 68) {
		// alert("Hi")
		pogo.frame.body.angularVelocity = -twistval
		// pogo.stick.body.angularVelocity+=twistval
	}
}

function keyup(evt) {
	// t = 5;
	// switch(evt.keyCode){
	// case 39: // right
	// torque = -t;
	// break;
	// case 37: // left
	// torque = t;
	// break;
	// }
	
	if (evt.keyCode == 65) {
		pogo.spring.restLength = 0.75;
		pogo.spring.applyForce();
	}
	
	if (evt.keyCode == 83 || evt.keyCode == 68) {
		// alert("Hi")
		pogo.frame.body.angularVelocity = 0
		// pogo.stick.body.angularVelocity+=twistval
	}
//	if (evt.keyCode == 100) {
//		// alert("Hi")
//		pogo.frame.body.angularVelocity = -twistval
//		// pogo.stick.body.angularVelocity+=twistval
//	}
	
}
var twistval = 5;
function keypress(evt) {
	// alert(evt.keyCode)
	 if (evt.keyCode == 115) {
	 // alert("Hi")
	 pogo.frame.body.angularVelocity=twistval
	 // pogo.stick.body.angularVelocity+=twistval
	 }
	 if (evt.keyCode == 100) {
	 // alert("Hi")
	 pogo.frame.body.angularVelocity=-twistval
	 // pogo.stick.body.angularVelocity+=twistval
	 }
}

function drawpogo() {
	drawbox(pogo.stick)
	drawbox(pogo.frame)
	// drawBox({body: boxBody, shape: boxShape})
}

// function drawcircle(obj) {
// var x = obj.body.interpolatedPosition[0],
// y = obj.body.interpolatedPosition[1];
// ctx.arc(95,50,40,0,2*Math.PI);
// ctx.stroke();
// }

function drawbox(obj) {
	ctx.beginPath();
	var x = obj.body.interpolatedPosition[0], y = obj.body.interpolatedPosition[1];
	ctx.save();
	ctx.translate(x, y); // Translate to the center of the box
	ctx.rotate(obj.body.angle); // Rotate to the box body frame
	ctx.rect(-obj.shape.width / 2, -obj.shape.height / 2, obj.shape.width,
			obj.shape.height);
	ctx.stroke();
	ctx.restore();
}
function drawPlane() {
	var y = planeBody.interpolatedPosition[1];
	ctx.moveTo(-w, y);
	ctx.lineTo(w, y);
	ctx.stroke();
}

var xscroll = 0
function render() {
	// Clear the canvas
	ctx.clearRect(0, 0, w, h);
	// Transform the canvas
	// Note that we need to flip the y axis since Canvas pixel coordinates
	// goes from top to bottom, while physics does the opposite.
	
	
	ctx.save();
	xscroll = -pogo.frame.body.position[0]
//	ctx.translate(xscroll, 0)
	
	ctx.translate(w / 2, h / 2); // Translate to the center
	ctx.scale(50, -50); // Zoom in and flip y axis
	
	ctx.translate(xscroll, 0)
	// Draw all bodies
	// drawbox(pogo.frame);
	drawpogo();
	// drawBox(pogo.frame)
	// drawPlane();
	var y = heightfield.body.position[1]
	// y = -1
	var x = heightfield.body.position[0]
	
	
//	x+=xscroll
	// x = 0
	
	// ctx.beginPath();
	ctx.moveTo(x, y + data[0]);
	
	var i = 0;
	for ( var d in data) {
		ctx.lineTo(x + i * heightfield.shape.elementWidth, y + data[i]);
		i += 1;
	}
	// ctx.lineTo(gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,-gameHeight/2);
	ctx.stroke();
	// Restore transform
	ctx.restore();
}
// Animation loop

speed = 60*5
//speed = 1/speed
var lastTime;
var maxSubSteps = 5; // Max physics ticks per render frame
var fixedDeltaTime = 1 / speed; // Physics "tick" delta time
function animate(time) {
	requestAnimationFrame(animate);
	// Get the elapsed time since last frame, in seconds
	var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
	lastTime = time;
	// Make sure the time delta is not too big (can happen if user switches
	// browser tab)
	deltaTime = Math.min(1 / 10, deltaTime);
	// Move physics bodies forward in time
	world.step(fixedDeltaTime, deltaTime, maxSubSteps);
	// Render scene
	render();
}