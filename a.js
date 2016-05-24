
var canvas, ctx, w, h, world, planeBody, boxBody, boxShape;
var pogo;
var data = [];
var heightfield = new Object();

var gameOver = false

var av = -0.25

function play() {
	document.getElementById("menu").style.display = 'none'
	document.getElementById("myCanvas").style.display = 'inline'
	init();
	requestAnimationFrame(animate);
}

function init() {
	// Init canvas
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;
	// Init p2.js
	
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
	
	initgame()
	
	window.addEventListener("keydown", keydown, false);
	window.addEventListener("keyup", keyup, false);
	window.addEventListener("keypress", keypress, false);
	
	canvas.onmousedown = onmousedown
	
	canvas.addEventListener('touchstart', ontouchstart, false);        
	canvas.addEventListener('touchmove', ontouchmove, false);
	canvas.addEventListener('touchend', ontouchend, false);
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

var lastmouse = {
		x: null,
		y: null
}

function ontouchstart(e) {
	pogo.spring.restLength = 0.25;
	pogo.spring.applyForce();
}

function ontouchmove(e) {
	e.preventDefault();
	if(lastmouse.x!=null) {
    	if (lastmouse.x!=e.touches[0].clientX||true) {
    		a = lastmouse.x-e.touches[0].clientX;
    		b = lastmouse.y-e.touches[0].clientY;
    		pogo.frame.body.angularVelocity = 3*((Math.atan(a/b)-pogo.frame.body.angle));
    	} else {
    		pogo.frame.body.angularVelocity = 0;
    	}
    } else {
	    lastmouse = {
    			x: e.touches[0].clientX,
    			y: e.touches[0].clientY
    	}
    }
    currentmouse = e
    mousedrag = true
}

function ontouchend(e) {
	currentmouse = null
    mousedrag = false
    lastmouse = {
    		x: null,
    		y: null
    }
    pogo.frame.body.angularVelocity = 0;
    pogo.spring.restLength = 1.25;
    pogo.spring.applyForce();
}

var mousedrag = false

var currentmouse = null

function onmousedown() {
	pogo.spring.restLength = 0.25;
	pogo.spring.applyForce();
	
		  document.onmousemove = function(e) {
			  
//		    e = e || event
//		    fixPageXY(e)  
		    // put ball center under mouse pointer. 25 is half of width/height
//		    self.style.left = e.pageX-25+'px' 
//		    self.style.top = e.pageY-25+'px' 
		    if(lastmouse.x!=null) {
		    	if (lastmouse.x!=e.clientX||true) {
		    		a = lastmouse.x-e.clientX;
		    		b = lastmouse.y-e.clientY;
		    		pogo.frame.body.angularVelocity = 3*((Math.atan(a/b)-pogo.frame.body.angle));
		    	} else {
		    		pogo.frame.body.angularVelocity = 0;
		    	}
		    } else {
			    lastmouse = {
		    			x: e.clientX,
		    			y: e.clientY
		    	}
		    }
		    currentmouse = e
		    mousedrag = true
		  }
		  this.onmouseup = function() {
		    document.onmousemove = null
		    currentmouse = null
		    mousedrag = false
		    lastmouse = {
		    		x: null,
		    		y: null
		    }
		    pogo.frame.body.angularVelocity = 0;
		    pogo.spring.restLength = 1.25;
		    pogo.spring.applyForce();
		  }
}

var keys = {
	left: 37,
	right: 39,
	up: 38
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
	
	if([32, 37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
        evt.preventDefault();
    }
	
//	alert(evt.keyCode)
	if (evt.keyCode == keys.up) {
		pogo.spring.restLength = 1.25;
		pogo.spring.applyForce();
	}
	
	if (evt.keyCode == keys.left) {
		// alert("Hi")
		pogo.frame.body.angularVelocity = +twistval
		// pogo.stick.body.angularVelocity+=twistval
	}
	if (evt.keyCode == keys.right) {
		// alert("Hi")
		pogo.frame.body.angularVelocity = -twistval
		// pogo.stick.body.angularVelocity+=twistval
	}
	
//	return !(evt.keyCode == 32 && (evt.target.type != 'text' && evt.target.type != 'textarea'));
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
	
//	if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
//        e.preventDefault();
//    }
	
	if (evt.keyCode == keys.up) {
		pogo.spring.restLength = 0.25;
		pogo.spring.applyForce();
	}
	
	if (evt.keyCode == keys.left || evt.keyCode == keys.right) {
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
//	if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
//        e.preventDefault();
//    }
	
	 if (evt.keyCode == keys.left) {
	 // alert("Hi")
	 pogo.frame.body.angularVelocity=twistval
	 // pogo.stick.body.angularVelocity+=twistval
	 }
	 if (evt.keyCode == keys.right) {
	 // alert("Hi")
	 pogo.frame.body.angularVelocity=-twistval
	 // pogo.stick.body.angularVelocity+=twistval
	 }
}

var colorful = true;

function toggleColor() {
	colorful=!colorful;
}

function drawpogo() {
	ctx.fillStyle = "#ff66ff";
	drawbox(pogo.stick)
	if(colorful) {
		ctx.fill();
	}
	ctx.fillStyle = "#ed00ed";
	drawbox(pogo.frame)
	if(colorful) {
		ctx.fill();
	}
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
	if(pogo.frame.body.position[0]<0) {
		gameOver = true;
	}
	// Clear the canvas
	ctx.clearRect(0, 0, w, h);
	
	if(colorful) {
		ctx.fillStyle = "#4d79ff";
		ctx.fillRect(0,0,w,h);
		ctx.fill()
	}
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
	ctx.strokeStyle = "#000000";
	drawpogo();
	// drawBox(pogo.frame)
	// drawPlane();
	var y = heightfield.body.position[1]
	// y = -1
	var x = heightfield.body.position[0]
	
	
//	x+=xscroll
	// x = 0
	
	ctx.beginPath();
	ctx.moveTo(x, -h/100);
	
	var i = 0;
	for ( var d in data) {
		ctx.lineTo(x + i * heightfield.shape.elementWidth, y + data[i]);
		i += 1;
	}
	ctx.lineTo(x+data.length-1*heightfield.shape.elementWidth, -h/100)
	// ctx.lineTo(gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,-gameHeight/2);
	ctx.closePath()
	ctx.fillStyle = "#00b300"
	if(colorful) {
		ctx.fill();
	}
	ctx.stroke();
	// Restore transform
	
	ctx.restore();
	
	if(mousedrag) {
		var rect = canvas.getBoundingClientRect();
		var mx1 = Math.round((lastmouse.x-rect.left)/(rect.right-rect.left)*canvas.width);
		var my1 = Math.round((lastmouse.y-rect.top)/(rect.bottom-rect.top)*canvas.height);
		var mx2 = Math.round((currentmouse.clientX-rect.left)/(rect.right-rect.left)*canvas.width);
		var my2 = Math.round((currentmouse.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height);
		ctx.beginPath();
		var origw = ctx.lineWidth
		ctx.lineWidth = 2
		ctx.strokeStyle = "#999999";
		ctx.moveTo(mx1, my1);
		ctx.lineTo(mx2, my2);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(mx2, my2, 4, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#999999";
		ctx.stroke();
		ctx.fill();
		ctx.lineWidth = origw
	}
	
	if(gameOver) {
		ctx.font = "30px Comic Sans MS";
		ctx.fillStyle = "red";
		ctx.textAlign = "center";
		if (!pendingquit) {
			score = Math.round(pogo.frame.body.position[0]);
			pendingquit = true
			setTimeout(function() {
//				return;
				gameOver = false
				pendingquit = false
				initgame();
			}, 1000*3);
		}
		ctx.fillText(score, canvas.width/2, canvas.height/2); 
	}
}
var score = null
var pendingquit = false

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


//while (true) {
//	playGame();
//}