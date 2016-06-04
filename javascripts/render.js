var canvas, ctx, w, h;

var colorful = true;

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

// Animation loop

speed = 60*5
//speed = 1/speed
var lastTime;
var maxSubSteps = 5; // Max physics ticks per render frame
var fixedDeltaTime = 1 / speed; // Physics "tick" delta time
function animate(time) {
	if(!pause) {
		requestAnimationFrame(animate);
	}
	// Get the elapsed time since last frame, in seconds
	var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
	lastTime = time;
	// Make sure the time delta is not too big (can happen if user switches
	// browser tab)
	deltaTime = Math.min(1 / 10, deltaTime);
	// Move physics bodies forward in time
	world.step(fixedDeltaTime, deltaTime, maxSubSteps);
	// Render scene
	if(!tutorialm) {
		render();
	} else {
		rendertut()
	}
}

var xscroll = 0
var yscroll = 0
function render() {
	if(pogo.frame.body.position[0]<0) {
		gameOver = true;
		leftplay = false;
		pogo.frame.body.position[0]=Math.max(pogo.frame.body.position[0], -2)
		pogo.frame.body.position[1]=Math.max(pogo.frame.body.position[1], -5)
	}
	// Clear the canvas
	ctx.clearRect(0, 0, w, h);
	
	if(colorful) {
		ctx.fillStyle = color.sky;
	} else {
		ctx.fillStyle = "#FFFFFF"
	}
	
	ctx.fillRect(0,0,w,h);
	ctx.fill()
	
	
	// Transform the canvas
	// Note that we need to flip the y axis since Canvas pixel coordinates
	// goes from top to bottom, while physics does the opposite.
	
	
	ctx.save();
	xscroll = -pogo.frame.body.position[0]
	v = pogo.frame.body.position[1]-yscroll
	
	if (Math.abs(v)>0.35) {
		lerpval = 0.015
	} else {
		lerpval = 0.01
	}
	
	if (v<-0.2) {
		lerpval = 0.0325
	}
	yscroll = v*lerpval+yscroll
//	yscroll = Math.max(yscroll, 0)
//	yscroll = Math.min(yscroll, 1)
	
//	ctx.translate(xscroll, 0)
	
	ctx.translate(w / 2, h / 2); // Translate to the center
	ctx.scale(50, -50); // Zoom in and flip y axis
	
	ctx.translate(xscroll, -yscroll)
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
	ctx.moveTo(x, -h/50);
	
	var px = pogo.frame.body.position[0]
	
	var i = 0;
	for ( var d in data) {
		var x1 = i * heightfield.shape.elementWidth
		if(x1>=px-w/50/2-1) {
			ctx.lineTo(x + x1, y + data[i]);
		}
		if(x1>px+w/50/2+2) {
			break;
		}
		i += 1;
	}
	ctx.lineTo(x+data.length-1*heightfield.shape.elementWidth, -h/50)
	// ctx.lineTo(gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,-gameHeight/2);
	ctx.closePath()
	ctx.fillStyle = color.ground
	if(colorful) {
		ctx.fill();
	}
	ctx.stroke();
	
	drawObstacles();
	
	// Restore transform
	
	ctx.restore();
	
	var rect = canvas.getBoundingClientRect();
	
	ctx.save()
	if(fixedjoy) {
		var jx = Math.round((jloc.x-rect.left)/(rect.right-rect.left)*canvas.width)
		var jy = Math.round((jloc.y-rect.top)/(rect.bottom-rect.top)*canvas.height);
		ctx.beginPath();
		ctx.arc(jx, jy, 50, 0, 2 * Math.PI, false);
		ctx.globalAlpha=0.5;
//		ctx.endPath();
		ctx.fillStyle= "#555555"
		ctx.fill()
		
		ctx.beginPath();
		ctx.arc(jx, jy, 10, 0, 2 * Math.PI, false);
		ctx.globalAlpha=0.7;
//		ctx.endPath();
		ctx.fillStyle= "#AAAAAA"
		ctx.fill()
	}
	ctx.restore()
	
	if(mousedrag) {
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
	
	ctx.font = "20px Comic Sans MS";
	ctx.fillStyle = "#555555";
	ctx.textAlign = "center";
	ctx.fillText("Next obstacle: "+Math.floor((r*2)-pogo.frame.body.position[0]%(r*2)), w-100, h-20);
	
	if(gameOver) {
		ctx.font = "30px Comic Sans MS";
		ctx.fillStyle = "red";
		ctx.textAlign = "center";
		if (!pendingquit) {
			score = Math.round(pogo.frame.body.position[0]);
			pendingquit = true
			setTimeout(function() {
//				return;
				if(leftplay) {
					leftplay=false;
					return;
				}
				gameOver = false
				pendingquit = false
				initgame();
			}, 1000*3);
		}
		ctx.fillText("Score: "+score, canvas.width/2, canvas.height/2-40); 
	} else {
		ctx.font = "16px Comic Sans MS";
		ctx.fillStyle = "black";
		ctx.textAlign = "left";

		score = Math.round(pogo.frame.body.position[0]);
		
		ctx.fillText("Score: "+score, 10, 20); 
	}
}

function drawpogo() {
	ctx.fillStyle = color.stick;
	drawbox(pogo.stick)
	if(colorful) {
		ctx.fill();
	}
	ctx.fillStyle = color.body;
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

function drawObstacles() {
	var m = w/50/2
	var d = m-1
	var px = pogo.frame.body.position[0]
	var i1 = Math.floor((px+d)/(r*2))
	
	for(var i = 0; i < obstacles.length; i++) {
		o = obstacles[i]
		if(Math.abs(o.position[0]-px)<=m) {
			ctx.beginPath();
			ctx.arc(o.position[0], o.position[1], 0.5, 0, 2 * Math.PI, false);
			ctx.stroke()
		}
	}
	
	
	
	
//	if(px+d<obstacles[i].position[0]) {
//		ctx.beginPath();
//		ctx.arc(px+d, obstacles[i].position[1], 0.5, 0, 2 * Math.PI, false);
//		ctx.strokeStyle = "#555555"
//		ctx.stroke()
	canvas_arrow(px+d-0.3, obstacles[i1].position[1], px+d+0.5, obstacles[i1].position[1])
//	}
	ctx.strokeStyle = "#000000"
}

// from http://stackoverflow.com/a/6333775
function canvas_arrow(fromx, fromy, tox, toy){
    var headlen = 0.5;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    ctx.stroke()
}