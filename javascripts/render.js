var canvas, ctx, w, h;

var colorful = true;

var colordef = {
		sky: "#4d79ff",
		skyday: "#4d79ff",
		skynight: "#241c52",
		ground: "#00b300",
		body: "#ed00ed",
		stick: "#ff66ff"
}

var color = {
		sky: "#4d79ff",
		skyday: "#4d79ff",
		skynight: "#241c52",
		ground: "#00b300",
		body: "#ed00ed",
		stick: "#ff66ff"
}

var currentRainAmnt = 0

var rainAmnt = 2;

var addedClouds=false

var cloudSpeed = 1;
var cloudSize = 100;
var cloudSpeedDef = 1.5;
var cloudSpeedMin = 0.2;
var cloudCnt = 5;

function updateCloud() {
	this.x-=this.xoffset
	this.y-=this.yoffset
	
	for(var i = 0; i < this.rain.particles.length; i++) {
		this.rain.particles[i].x-=this.xoffset
		this.rain.particles[i].y-=this.yoffset
	}
	
	for(var i = 0; i < this.rain.drops.length; i++) {
		this.rain.drops[i].x-=this.xoffset
		this.rain.drops[i].y-=this.yoffset
	}
	
	var localparticles = this.rain.particles;
	var localdrops = this.rain.drops;
	
	for (var i = 0, activeparticles; activeparticles = localparticles[i]; i++) {
		activeparticles.x += activeparticles.velX;
		activeparticles.y += activeparticles.velY+5;
		var gh = 0;
		var worldX = activeparticles.x/50-xscroll-w/50/2
		if(worldX<w/50/2+1) {
//			console.log(worldX)
		}
		var idx;
		if(worldX>sectionB.h.body.position[0]) { // in sectionB
			 var real = (worldX-sectionB.h.body.position[0])/2
			 idx = Math.floor(real)
			var amnt = (real%2)/2
			var diff = (sectionB.d[idx+1]-sectionB.d[idx])||0
			gh = -(sectionB.d[idx]+diff*amnt)*50
//			gh = -sectionB.d[idx]*50
		} else { // in sectionA
			
			var real = (worldX-sectionA.h.body.position[0])/2
			idx = Math.floor(real)
			var amnt = ((real*2)%2)/2
			var diff = (sectionA.d[idx+1]-sectionA.d[idx])||0
			gh = -(sectionA.d[idx]+diff*amnt)*50
//			gh = -sectionA.d[idx]*50
		}
		gh+=h/2
		gh+=yscroll*50
		gh+=50
//		this.worldX = Math.floor(worldX)
		if (activeparticles.y > gh) {//height-15) {
			localparticles.splice(i--, 1);
			this.rain.splash(activeparticles.x, activeparticles.y, activeparticles.col);
		}
		/*var umbrella = (activeparticles.X - mouse.X)*(activeparticles.X - mouse.X) + (activeparticles.Y - mouse.Y)*(activeparticles.Y - mouse.Y);
			if (controls.Object == "Umbrella") {
				if (umbrella < 20000 && umbrella > 10000 && activeparticles.Y < mouse.Y) {
					explosion(activeparticles.X, activeparticles.Y, activeparticles.col);
					localparticles.splice(i--, 1);
				}
			}
			if (controls.Object == "Cup") {
				if (umbrella > 20000 && umbrella < 30000 && activeparticles.X+138 > mouse.X && activeparticles.X-138 < mouse.X && activeparticles.Y > mouse.Y) {
					explosion(activeparticles.X, activeparticles.Y, activeparticles.col);
					localparticles.splice(i--, 1);
				}
			}
			if (controls.Object == "Circle") {
				if (umbrella < 20000) {
					explosion(activeparticles.X, activeparticles.Y, activeparticles.col);
					localparticles.splice(i--, 1);
				}
			}*/
	}

	for (var i = 0, activedrops; activedrops = localdrops[i]; i++) {
		activedrops.x += activedrops.velX;
		activedrops.y += activedrops.velY;
		activedrops.radius -= 0.075;
		if (activedrops.alpha > 0) {
			activedrops.alpha -= 0.005;
		} else {
			activedrops.alpha = 0;
		}
		if (activedrops.radius < 0) {
			localdrops.splice(i--, 1);
		}
	}

	var i = currentRainAmnt;
	while (i--) {
		this.rain.addRaindrops(Math.floor(this.x-cloudSize+(Math.random()*cloudSize)), this.y-15);
	}
	
	var left = this.x<-cloudSize
	var right = this.x>this.w*2+cloudSize
	if(left||right) {
		this.y = (this.h/2-20-this.h/(1.75*50)-10)*Math.random()-10
		this.speed = Math.random()*(cloudSpeedDef-cloudSpeedMin)+cloudSpeedMin
		if(left) {
			this.x = this.w+cloudSize // to right
		} else {
			this.x = -cloudSize; // to left
		}
//		this.x = (this.x+this.w)%this.w;
	}
	
	this.x+=this.speed*cloudSpeed;
}

//based off of https://codepen.io/Sheepeuh/pen/cFazd?editors=0010
function addRaindrops(x, y, pieces) {
	pieces=pieces||2
	
	while (pieces--) {
		this.particles.push( 
		{
			velX : (Math.random() * 0.25),
			velY : (Math.random() * 9) + 1,
			x: x,
			y: y,
			alpha : 1,
			col : "hsla(200, 100%, 50%, 0.8)",
		})
	}
}

var splashSize = 5

function splash(x, y, col, cnt) {
	cnt=cnt||splashSize
	while(cnt--) {
		this.drops.push( 
				{
					velX : (Math.random() * 4-2	),
					velY : (Math.random() * -4 ),
					x: x,
					y: y,
					radius : 0.65 + Math.floor(Math.random() *1.6),
					alpha : 1,
					col : col
				})
	}
}

function renderCloud() {
	var tau = Math.PI * 2;
	var localparticles = this.rain.particles
	var localdrops = this.rain.drops
	for (var i = 0, activeparticles; activeparticles = localparticles[i]; i++) {
		ctx.globalAlpha = activeparticles.alpha;
		ctx.fillStyle = activeparticles.col;
		ctx.fillRect(activeparticles.x, activeparticles.y, activeparticles.velY/4, activeparticles.velY);
	}
	
	for (var i = 0, activedrops; activedrops = localdrops[i]; i++) {
		
		ctx.globalAlpha = activedrops.alpha;
		ctx.fillStyle = activedrops.col;
		
		ctx.beginPath();
		ctx.arc(activedrops.x, activedrops.y, activedrops.radius, 0, tau);
		ctx.fill();
	}
	
	ctx.shadowBlur=7;
	ctx.shadowColor="black";
	ctx.font = cloudSize+"px FontAwesome";
	ctx.globalAlpha="0.7"
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "center";
	ctx.fillText("\uf0c2", this.x-cloudSize/2, this.y)
	ctx.shadowBlur=0;
	ctx.globalAlpha="1"
}

function Cloud(x, y, speed, w, h) {
	this.x = x;
	this.y = y;
	this.xoffset = 0;
	this.yoffset = 0;
	this.worldX = 0;
	this.w = w;
	this.h = h;
	this.speed = speed;
	this.update = updateCloud;
	this.render = renderCloud;
	this.rain = {
		pieces: 2,
		particles: [],
		drops: [],
		addRaindrops: addRaindrops,
		splash: splash
	};
}

var clouds = [];

function initRender() {
	clouds = [];
	for(var i = 0; i < cloudCnt; i++) {
		clouds.push(new Cloud(Math.random()*w, (h/2-20-h/(1.75*50)-10)*Math.random()-10, Math.random()*(cloudSpeedDef-cloudSpeedMin)+cloudSpeedMin, w, h))
	}
	
	lastpx = w/50/2;
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

var endscore = 0


//from http://stackoverflow.com/a/11293378
function lerp(a, b, u) {
    return (1 - u) * a + u * b;
};


//from http://stackoverflow.com/a/5624139
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function render() {
//	console.log(pogo.stick.body.position[0])
	
	var px = pogo.frame.body.position[0]
	if(px>secwidth) {
//		console.log("Sec #2")
	}
	
	if(px-w/50/2>secwidth) {
		removeSection(sectionA)
		removeSection(sectionB)
		sectionA=changenum(sectionB, 0, 1)
		sectionB=changenum(generateSection(), 1, 0);
//		console.log(pogo.frame.body.position[0]/secwidth)
		pogo.frame.body.position[0]-=secwidth
		pogo.stick.body.position[0]-=secwidth
//		console.log(pogo.frame.body.position[0]/secwidth)
//		console.log("Sec #1")
		addSection(sectionA)
		addSection(sectionB)
		score+=secwidth
	}
	
	if(px<w/50/2&&secnum>2) {
		removeSection(sectionA)
		removeSection(sectionB)
		secnum-=2
		sectionB=changenum(sectionA, 1, 0)
		sectionA=generateSection()
//		console.log(pogo.frame.body.position[0]/secwidth)
		pogo.frame.body.position[0]+=secwidth
		pogo.stick.body.position[0]+=secwidth
//		console.log(pogo.frame.body.position[0]/secwidth)
//		console.log("Sec #1")
		addSection(sectionA)
		addSection(sectionB)
		score-=secwidth
	}
	
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
	var xdelta = (Math.max(pogo.frame.body.position[0], w/50/2)+xscroll)*50%secwidth
	for(var i = 0; i < clouds.length; i++) {
		clouds[i].xoffset=xdelta;
	}
	
	var ysold = yscroll;
	
	
	
	
	if(px>=w/50/2) {
		xscroll = -pogo.frame.body.position[0]
	}
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
	
	var progress = distToTime(score+pogo.frame.body.position[0]-w/50/2) // half days
	
	var angle = progress*Math.PI-Math.PI
	
	ctx.font = "100px FontAwesome";
	ctx.fillStyle = "#ffff00";
	ctx.textAlign = "center";
	ctx.fillText("\uf185", Math.cos(angle)*h/2+w/2, Math.sin(angle)*h/2+yscroll*50+5*h/9)
	
	ctx.fillStyle = "#ddddff";
	ctx.textAlign = "center";
	ctx.fillText("\uf186", Math.cos(angle+Math.PI)*h/2+w/2, Math.sin(angle+Math.PI)*h/2+yscroll*50+5*h/9)
	
	var nightCol = hexToRgb(color.skynight)
	var dayCol = hexToRgb(color.skyday)
	
	var t = (progress+0.5)%2 // shift left a quarter day and make it between 0 and 2 for a full day
	
	var a = dayCol
	var b = nightCol
	
	if(t>1) {
		var tmp = a;
		a = b;
		b = tmp;
	}
	
	var r = Math.round(lerp(a.r, b.r, 1-t%1));
    var g = Math.round(lerp(a.g, b.g, 1-t%1));
    var b = Math.round(lerp(a.b, b.b, 1-t%1));
    
    color.sky = rgbToHex(r, g, b)
    var skyold = color.sky
    
    var caveFade = 0.025
    
    if(progress>2&&progress%2<1-caveFade) {
    	color.sky="#222222"
    }
    
    if(progress%2>2-caveFade) {
    	a = hexToRgb(color.sky)
		b = hexToRgb("#222222")
		
		var val = 1-(2-progress%2)*1/caveFade
		
		var r = Math.round(lerp(a.r, b.r, val));
        var g = Math.round(lerp(a.g, b.g, val));
        var b = Math.round(lerp(a.b, b.b, val));
        
        color.sky = rgbToHex(r, g, b)
	}
	
	if(progress>2&&progress%2>1-caveFade) {
		b = hexToRgb(color.sky)
		a = hexToRgb("#222222")
		
		var val = 1-(1-progress%2)*1/caveFade
		
		var r = Math.round(lerp(a.r, b.r, val));
        var g = Math.round(lerp(a.g, b.g, val));
        var b = Math.round(lerp(a.b, b.b, val));
        
        color.sky = rgbToHex(r, g, b)
	}
	
	if(((progress>2&&progress%2>1)||(progress<2))&&progress%2<2-caveFade) {
		color.sky = skyold
		color.ground=colordef.ground
	}
	
	// Ground
	
	if(progress>2&&progress%2<=1) {
    	color.ground="#222222"
    }
    
    if(progress%2>2-caveFade) {
    	a = hexToRgb(colordef.ground)
		b = hexToRgb("#222222")
		
		var val = 1-(2-progress%2)*1/caveFade
		
		var r = Math.round(lerp(a.r, b.r, val));
        var g = Math.round(lerp(a.g, b.g, val));
        var b = Math.round(lerp(a.b, b.b, val));
        
        color.ground = rgbToHex(r, g, b)
	}
	
	if(progress>2&&progress%2>1-caveFade) {
		b = hexToRgb(colordef.ground)
		a = hexToRgb("#555555")
		
		var val = 1-(1-(progress%2))*1/caveFade
		
		var r = Math.round(lerp(a.r, b.r, val));
        var g = Math.round(lerp(a.g, b.g, val));
        var b = Math.round(lerp(a.b, b.b, val));
        
        color.ground = rgbToHex(r, g, b)
	}
	
	if(progress>2&&progress%2>1&&progress%2<2-caveFade) {
		color.ground=colordef.ground
	}
	
	if(!addedClouds&&progress>3) {
		for(var i = 0; i < cloudCnt; i++) {
			clouds.push(new Cloud(Math.random()*w, (h/2-20-h/(1.75*50)-10)*Math.random()-10, Math.random()*(cloudSpeedDef-cloudSpeedMin)+cloudSpeedMin, w, h))
		}
		addedClouds=true
	}
	
	if(progress>3) {
		currentRainAmnt = (progress%2>1)?rainAmnt:0;
	}

	
	ctx.save();
//	yscroll = Math.max(yscroll, 0)
//	yscroll = Math.min(yscroll, 1)
	
//	ctx.translate(xscroll, 0)
	
	ctx.translate(w / 2, h / 2); // Translate to the center
	ctx.scale(50, -50); // Zoom in and flip y axis
	
	for(var i = 0; i < clouds.length; i++) {
		clouds[i].yoffset=-(yscroll-ysold)*50
	}
	
	ctx.translate(xscroll, -yscroll)
	// Draw all bodies
	// drawbox(pogo.frame);
	ctx.strokeStyle = "#000000";
	drawpogo();
	
	// drawBox(pogo.frame)
	// drawPlane();
//	var y = heightfield.body.position[1]
//	// y = -1
//	var x = heightfield.body.position[0]
	
	
//	x+=xscroll
	// x = 0
	
//	var x = sectionA.h.body.position[0]
//	var y = sectionA.h.body.position[1]
	var x = -1;
	var y = -1;
	
	ctx.beginPath();
	ctx.moveTo(x, -h/50*7/4);
	
	var px = -xscroll//pogo.frame.body.position[0]
	
	var cdata = sectionA.d.slice(0, -1).concat(sectionB.d)
	
	for (var i = 0; i < cdata.length; i++) {
		var x1 = i * 2//sectionA.h.shape.elementWidth
		if(x1>=px-w/50/2-1) {
			ctx.lineTo(x + x1, y + cdata[i]);
		}
		
//		if(i==sectionA.d.length-1){
//			ctx.lineTo(x+x1, -h/50)
//		}
		if(x1>px+w/50/2+2) {
			break;
		}
//		i += 1;
	}
	
	
	ctx.lineTo(x+cdata.length*2-2, -h/50*7/4)
	// ctx.lineTo(gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,gameHeight/2);
	// ctx.lineTo(-gameWidth/2,-gameHeight/2);
	ctx.closePath()
	ctx.fillStyle = color.ground
	if(colorful) {
		ctx.fill();
	}
	ctx.stroke();
	
	///////////////////////////////////////////////
	var ah1 = sectionA.h1!=null
	var bh1 = sectionB.h1!=null
	
	ctx.fillStyle="#555555"
	
	if(ah1) {
		ctx.beginPath();
		
		var startpos = sectionA.h1.body.position
		var dat = sectionA.h1verts
		
//		console.log(xstart)
//		console.log("")
//		console.log(dat.length)
		ctx.moveTo(dat[0][0]+startpos[0], dat[0][1]+startpos[1]);
		for (var i = 1; i < dat.length-1; i++) {
			var x1 = i * 2//sectionA.h.shape.elementWidth
//			if(startpos[0] + x1>=px-w/50/2-1) {
				ctx.lineTo(startpos[0] + dat[i][0], startpos[1]+dat[i][1]);
//			}
			
//			if(i==sectionA.d.length-1){
//				ctx.lineTo(x+x1, -h/50)
//			}
//			if(startpos[0] + x1>px+w/50/2+2) {
//				break;
//			}
//			i += 1;
		}
		
		
		ctx.lineTo(dat[dat.length-1][0]+startpos[0], dat[dat.length-1][1]+startpos[1])
		// ctx.lineTo(gameWidth/2,gameHeight/2);
		// ctx.lineTo(-gameWidth/2,gameHeight/2);
		// ctx.lineTo(-gameWidth/2,-gameHeight/2);
		ctx.closePath()
		if(colorful) {
			ctx.fill();
		}
		ctx.stroke();
		}
	
	if(bh1) {
		ctx.beginPath();
		
		
		var startpos = sectionB.h1.body.position
		var dat = sectionB.h1verts
		
//		console.log(xstart)
//		console.log("")
//		console.log(dat.length)
		ctx.moveTo(dat[0][0]+startpos[0], dat[0][1]+startpos[1]);
		for (var i = 1; i < dat.length-1; i++) {
			var x1 = i * 2//sectionA.h.shape.elementWidth
//			if(startpos[0] + x1>=px-w/50/2-1) {
				ctx.lineTo(startpos[0] + dat[i][0], startpos[1]+dat[i][1]);
//			}
			
//			if(i==sectionA.d.length-1){
//				ctx.lineTo(x+x1, -h/50)
//			}
//			if(startpos[0] + x1>px+w/50/2+2) {
//				break;
//			}
//			i += 1;
		}
		
		
		ctx.lineTo(dat[dat.length-1][0]+startpos[0], dat[dat.length-1][1]+startpos[1])
		// ctx.lineTo(gameWidth/2,gameHeight/2);
		// ctx.lineTo(-gameWidth/2,gameHeight/2);
		// ctx.lineTo(-gameWidth/2,-gameHeight/2);
		ctx.closePath()

		if(colorful) {
			ctx.fill();
		}
		ctx.stroke();
		}
	///////////////////////////////////
	
//	console.log(px/secwidth)
//	
	ctx.restore();
	for(var i = 0; i < clouds.length; i++) {
		clouds[i].update();
		clouds[i].render();
	}
	ctx.save();
	
	ctx.translate(w / 2, h / 2); // Translate to the center
	ctx.scale(50, -50); // Zoom in and flip y axis
	
	ctx.translate(xscroll, -yscroll)
	ctx.strokeStyle="#000000"
	drawObstacles1(sectionA)
	drawObstacles1(sectionB)
//	drawSection(sectionB)
	
	// Restore transform
	
	ctx.restore();
	
	var rect = canvas.getBoundingClientRect();
	
	ctx.save()
	if(fixedjoy&&!nojoystick) {
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
	
	if(mousedrag&&!nojoystick) {
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
	var dist = (Math.floor(((-xscroll-((progress>2&&progress%2<=1)?4:0))%secwidth)%(rarity*2)))
	ctx.fillText("Next obstacle: "+(((rarity*2)-dist)), 100, h-20);
	
	ctx.font = "20px Comic Sans MS";
	ctx.fillStyle = "#000000";
	ctx.textAlign = "left";
	ctx.fillText("Level/Half-Days: "+progress, 0, 60);
	
	if(gameOver) {
		ctx.font = "30px Comic Sans MS";
		ctx.fillStyle = "red";
		ctx.textAlign = "center";
		if (!pendingquit) {
			endscore = score + Math.round(pogo.frame.body.position[0])-Math.floor(w/50/2);
			newtopscore=false
//			console.log("TOP: "+topscore)
			if(endscore>topscore) {
				topscore=endscore
				newtopscore=true
				document.cookie = "topscore="+endscore+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
			}
			
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
		
		var msg = "";
		if(newtopscore) {
			msg = "New High Score!\n"
		}
		ctx.fillText(msg+"Score: "+endscore, canvas.width/2, canvas.height/2-40); 
	} else {
		ctx.font = "16px Comic Sans MS";
		ctx.fillStyle = "black";
		ctx.textAlign = "left";
		ctx.fillText("High Score: "+topscore, 10, 20); 
		ctx.fillText("Score: "+(score-Math.floor(w/50/2)+Math.round(pogo.frame.body.position[0])), 10, 36); 
	}
}

var newtopscore = false

// from w3schools
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function drawObstacles() {
	var m = w/50/2
	var d = m-1
	var px = -xscroll
	var i1 = Math.floor((px+d)/(rarity*2))
	
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

function drawObstacles1(s) {
	var b = s.h.body.position[0]!=-1
	var m = w/50/2
	var d = m-1
	var px = -xscroll//pogo.frame.body.position[0]
	var i1 = Math.floor(((px)+d)/(rarity*2))
	
	for(var i = 0; i < s.o.length; i++) {
		o = s.o[i]
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
//	console.log(s.o[i1])
	try {
	if(!b) {
		var co = sectionA.o.concat(sectionB.o)
	
	canvas_arrow(px+d-0.3, co[i1].position[1], px+d+0.5, co[i1].position[1])
//	}
	ctx.strokeStyle = "#000000"
	}
	} catch (e) {
		return;
	}
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