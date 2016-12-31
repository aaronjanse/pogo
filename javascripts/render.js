var canvas, ctx, w, h;
var progress = 0;

var colorful = true;

var scoreVal = 0;

var colordef = {
	sky: "#4d79ff",
	skyday: "#4d79ff",
	skynight: "#241c52",
	ground: "#00b300",
	body: "#ed00ed",
	stick: "#ff66ff"
}

var filtersEnabled = true;

var color = JSON.parse(JSON.stringify(colordef));
var currentRainAmnt = 0

var rainAmnt = 4;

var addedClouds = false

var cloudSpeed = 1;
var cloudSize = 100;
var cloudSpeedDef = 1.5;
var cloudSpeedMin = 0.2;
var cloudCnt = 5;



function getHatX(x) {
	var gh = 0;
	var worldX = x / 50 - xscroll - w / 50 / 2
	var idx;
	if (worldX > sectionB.h.body.position[0]) { // in sectionB
		var real = (worldX - sectionB.h.body.position[0]) / 2
		idx = Math.floor(real)
		var amnt = (real % 2) / 2
		var diff = (sectionB.d[idx + 1] - sectionB.d[idx]) || 0
		gh = -(sectionB.d[idx] + diff * amnt) * 50
	} else { // in sectionA

		var real = (worldX - sectionA.h.body.position[0]) / 2
		idx = Math.floor(real)
		var amnt = ((real * 2) % 2) / 2
		var diff = (sectionA.d[idx + 1] - sectionA.d[idx]) || 0
		gh = -(sectionA.d[idx] + diff * amnt) * 50
	}
	gh += h / 2
	gh += yscroll * 50
	gh += 50
	return gh;
}

function updateCloud() {
	for (var i = 0; i < this.snow.particles.length; i++) {
		this.snow.particles[i].x -= this.xoffset * 0.5
		this.snow.particles[i].y -= this.yoffset
	}


	this.snow.angle += 0.01;
	for (var i = 0; i < this.snow.mp; i++) {
		var p = this.snow.particles[i];
		// Updating X and Y coordinates
		// We will add 1 to the cos function to prevent negative values
		// which will lead flakes to move upwards
		// Every particle has its own density which can be used to make the
		// downward movement different for each flake
		// Lets make it more random by adding in the radius
		p.y += Math.cos(this.snow.angle + p.d) + 1 + p.r / 2;
		p.x += Math.sin(this.snow.angle) * 2;
		var lvl = distToTime(score + pogo.frame.body.position[0] - w / 50 / 2)
		if (this.idx != 0 || (Math.floor(lvl) == 6)) {
			continue;
		}
		// Sending flakes back from the top when it exits
		// Lets make it a bit more organic and let flakes enter from the
		// left and right also.
		var h = getHatX(p.x)
		if (lvl > 6) {
			h = 0;
			h += this.h / 2
			h += yscroll * 50
				//				h+=50
		}
		if (p.x > w + 5 || p.x < -5 || p.y > h) {
			if (i % 3 > 0) // 66.67% of the flakes
			{
				this.snow.particles[i] = {
					x: Math.random() * w * 2,
					y: -10,
					r: p.r,
					d: p.d
				};
			} else {
				// If the flake is exitting from the right
				if (Math.sin(this.snow.angle) > 0) {
					// Enter from the left
					this.snow.particles[i] = {
						x: -5,
						y: Math.random() * h,
						r: p.r,
						d: p.d
					}
				} else {
					// Enter from the right
					this.snow.particles[i] = {
						x: w + 5,
						y: Math.random() * h,
						r: p.r,
						d: p.d
					};
				}
			}
		}
	}


	this.x -= this.xoffset
	this.y -= this.yoffset

	for (var i = 0; i < this.rain.particles.length; i++) {
		this.rain.particles[i].x -= this.xoffset
		this.rain.particles[i].y += this.yoffset
	}

	//	this.xoffset = 0;

	for (var i = 0; i < this.rain.drops.length; i++) {
		this.rain.drops[i].x -= this.xoffset
		this.rain.drops[i].y -= this.yoffset
	}

	var localparticles = this.rain.particles;
	var localdrops = this.rain.drops;

	for (var i = 0, activeparticles; activeparticles = localparticles[i]; i++) {
		activeparticles.x += activeparticles.velX;
		activeparticles.y += activeparticles.velY + 5;
		var gh = getHatX(activeparticles.x)
		if (activeparticles.y > gh) { //height-15) {
			localparticles.splice(i--, 1);
			this.rain.splash(activeparticles.x, activeparticles.y, activeparticles.col);
		}

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
		if (this.idx != 0) {
			i = 0;
			break;
		}
		this.rain.addRaindrops(Math.random() * this.w * 2, -500); //this.x-cloudSize*2+(Math.random()*cloudSize*2)...this.y-15
	}

	var left = this.x < -cloudSize
	var right = this.x > this.w * 6 + cloudSize

	if ((cloudsVisible || newlyVisible) && (left || right)) {
		this.y = (this.h / 2 - 20 - this.h / (1.75 * 50) - 10) * Math.random() - 10
		this.speed = Math.random() * (cloudSpeedDef - cloudSpeedMin) + cloudSpeedMin
		if (left || justNowVisible) {
			this.x = this.w + cloudSize // to right
			if (justNowVisible) {
				this.x += this.w * 2.4 * (Math.random() + 0.25)
			}
		} else if (!newlyVisible) {
			this.x = -cloudSize; // to left
		}
	}

	if (cloudsVisible) {
		justNowVisible = false;
	} else {
		justNowVisible = true;
	}

	this.x += this.speed * cloudSpeed;
}

var newlyVisible = true;
var justNowVisible = true;

//based off of https://codepen.io/Sheepeuh/pen/cFazd?editors=0010
function addRaindrops(x, y, pieces) {
	pieces = pieces || 2

	while (pieces--) {
		this.particles.push({
			velX: (Math.random() * 0.25),
			velY: (Math.random() * 9) + 1,
			x: x,
			y: y,
			alpha: 1,
			col: "hsla(200, 100%, 50%, 0.8)",
		})
	}
}

var splashSize = 5

function splash(x, y, col, cnt) {
	cnt = cnt || splashSize
	while (cnt--) {
		this.drops.push({
			velX: (Math.random() * 4 - 2),
			velY: (Math.random() * -4),
			x: x,
			y: y,
			radius: 0.65 + Math.floor(Math.random() * 1.6),
			alpha: 1,
			col: col
		})
	}
}

var offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 300;
offscreenCanvas.height = 300;
var offscreenContext = offscreenCanvas.getContext('2d');


function renderCloud() {
	//	ctx.clearRect(0, 0, W, H);
	var val = Math.floor(distToTime(score + pogo.frame.body.position[0] - w / 50 / 2))
		//	console.log(val)
	if (val >= 5 && val != 6) {
		ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		ctx.beginPath();
		for (var i = 0; i < this.snow.mp; i++) {
			var p = this.snow.particles[i];
			ctx.moveTo(p.x, p.y);
			ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
		}
		ctx.fill();
	}

	var tau = Math.PI * 2;
	var localparticles = this.rain.particles
	var localdrops = this.rain.drops
	for (var i = 0, activeparticles; activeparticles = localparticles[i]; i++) {
		ctx.globalAlpha = activeparticles.alpha;
		ctx.fillStyle = activeparticles.col;
		ctx.fillRect(activeparticles.x, activeparticles.y, activeparticles.velY / 4, activeparticles.velY);
	}

	for (var i = 0, activedrops; activedrops = localdrops[i]; i++) {

		ctx.globalAlpha = activedrops.alpha;
		ctx.fillStyle = activedrops.col;

		ctx.beginPath();
		ctx.arc(activedrops.x, activedrops.y, activedrops.radius, 0, tau);
		ctx.fill();
	}

	// var image = offscreenContext.getImageData(0, 0, 300, 300);
	// cloudContext.putImageData(image, this.x ``- cloudSize / 2, this.y);

	ctx.drawImage(offscreenCanvas, 2 * (this.x - cloudSize / 2), this.y)


	return;
	ctx.shadowBlur = 7;
	ctx.shadowColor = "black";
	ctx.font = cloudSize + "px FontAwesome";
	ctx.globalAlpha = "0.7"
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "center";
	ctx.fillText("\uf0c2", 2 * (this.x - cloudSize / 2), this.y)
	ctx.shadowBlur = 0;
	ctx.globalAlpha = "1"
}

function Snow() {
	//	console.log("Hi1")
	this.angle = 0;
	this.mp = 45; //25; //max particles
	this.particles = [];
	for (var i = 0; i < this.mp; i++) {
		this.particles.push({
			x: Math.random() * w, //x-coordinate
			y: Math.random() * h, //y-coordinate
			r: Math.random() * 4 + 1, //radius
			d: Math.random() * this.mp //density
		})
	}
	//	console.log("Hi")

}

function Cloud(x, y, speed, w, h, idx) {
	//	console.log("Checking")
	this.idx = idx
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
		splash: splash
	};

	this.rain.addRaindrops = addRaindrops;

	//	console.log("Check")
	this.snow = new Snow();
	//	console.log("Check1")
}


var clouds = [];

function initRender() {
	//	console.log("Checking??")
	offscreenContext.fillStyle = "rgba(255, 255, 255, 0)"
	offscreenContext.fillRect(0, 0, 300, 300)
	offscreenContext.shadowBlur = 7;
	offscreenContext.shadowColor = "black";
	offscreenContext.font = cloudSize + "px FontAwesome";
	offscreenContext.globalAlpha = "0.7"
	offscreenContext.fillStyle = "#ffffff";
	// offscreenContext.textAlign = "left";
	offscreenContext.fillText("\uf0c2", 0, 80)

	clouds = [];
	for (var i = 0; i < cloudCnt; i++) {
		clouds.push(new Cloud(Math.random() * w, (h / 2 - 20 - h / (1.75 * 50) - 10) * Math.random() - 10, Math.random() * (cloudSpeedDef - cloudSpeedMin) + cloudSpeedMin, w * 1.2, h, i))
	}

	lastpx = w / 50 / 2;
}

// Animation loop

speed = 60 * 5
	//speed = 1/speed
var lastTime;
var maxSubSteps = 5; // Max physics ticks per render frame
var fixedDeltaTime = 1 / speed; // Physics "tick" delta time
function animate(time) {
	if (home) {
		return;
	}
	//	console.log("Checking??")
	if (!pause || !fullPause) {
		requestAnimationFrame(animate);
	} else {
		return;
	}

	if (keyboard) {
		if (keyspressed.up || keyspressed.space) {
			pogo.spring.restLength = 1.25;
			pogo.spring.applyForce();
		}

		if (!(keyspressed.left && keyspressed.right)) {
			if (keyspressed.left) {
				pogo.frame.body.angularVelocity = +twistval * keysensitivityval / 100
			}

			if (keyspressed.right) {
				pogo.frame.body.angularVelocity = -twistval * keysensitivityval / 100
			}
		}

		if (!keyspressed.up && !keyspressed.space) {
			pogo.spring.restLength = 0.25;
			pogo.spring.applyForce();
		}

		if (!keyspressed.left && !keyspressed.right && Math.abs(pogo.frame.body.angularVelocity) > twistval * keysensitivityval / 100 * 3 / 7) {
			pogo.frame.body.angularVelocity /= 8
		}
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
	if (!tutorialm) {
		render();
	} else {
		rendertut()
	}
}


var cloudsDark = false;

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

var fullPause = false;

var sendData = function (svalue) {
	if (!multiplayer) {
		return;
	}

	conn.send(svalue)
}

var alreadyWelcomed = false;

function manageSectioning() {
	var px = pogo.frame.body.position[0]

	if (px - w / 50 / 2 > secwidth) {
		removeSection(sectionA)
		removeSection(sectionB)

		for (var i = 0; i < sectionA.inverts.length; i++) {
			sectionA.inverts[i] = false
		}

		for (var i = 0; i < sectionB.inverts.length; i++) {
			sectionB.inverts[i] = false
		}

		for (var i = 0; i < sectionA.o.length; i++) {
			var o = sectionA.o[i]
			if (o.position[0] > sectionB.h.body.position[0]) {
				//				console.log(sectionB.o.length)
				sectionB.o.push(o)
				sectionA.o.splice(i, 1);
				sectionB.inverts.push(false)
				sectionA.inverts.splice(i, 1)
					//				console.log(sectionB.o.length)
			}
		}
		sectionA = changenum(sectionB, 0, 1)
		sectionB = changenum(generateSection(), 1, 0);
		pogo.frame.body.position[0] -= secwidth
		pogo.stick.body.position[0] -= secwidth
			//		console.log("Sec #1")
		addSection(sectionA)
		addSection(sectionB)
		score += secwidth
	}

	if (px < w / 50 / 2 && secnum > 2) {
		removeSection(sectionA)
		removeSection(sectionB)
		for (var i = 0; i < sectionA.inverts.length; i++) {
			sectionA.inverts[i] = !sectionA.inverts[i]
		}

		for (var i = 0; i < sectionB.inverts.length; i++) {
			sectionB.inverts[i] = !sectionB.inverts[i]
		}

		secnum -= 2
		sectionB = changenum(sectionA, 1, 0)
		sectionA = generateSection()
		pogo.frame.body.position[0] += secwidth
		pogo.stick.body.position[0] += secwidth
		updateObstacles()
			//		console.log("Sec #1")
		addSection(sectionA)
		addSection(sectionB)
		updateObstacles()
		score -= secwidth
	}
}

function logistic(val) {
	return Math.sign(val) / (1 + Math.pow(Math.E, -val));
}

function drawSunAndMoon() {
	var angle = progress * Math.PI - Math.PI

	ctx.font = "100px FontAwesome";
	ctx.fillStyle = "#ffff00";
	ctx.textAlign = "center";
	ctx.fillText("\uf185", Math.cos(angle) * h / 2 + w / 2, Math.sin(angle) * h / 2 + yscroll * 50 + 5 * h / 9)

	ctx.fillStyle = "#ddddff";
	ctx.textAlign = "center";
	ctx.fillText("\uf186", Math.cos(angle + Math.PI) * h / 2 + w / 2, Math.sin(angle + Math.PI) * h / 2 + yscroll * 50 + 5 * h / 9)
}

function render() {

	if (score > 5899 && !alreadyWelcomed) {
		alreadyWelcomed = true;
		alert("Welcome to the end. Sadly, no dragon (yet). P.S. I know you would never cheat to get here ;)")
	}

	//conn.send('' + score);
	if (pause) {
		if (fullPause || !filtersEnabled) {
			ctx.filter = "none";
			fullPause = true;
			return;
		} else {
			ctx.filter = "blur(30px)";
			fullPause = true;
		}
	} else {
		ctx.filter = "none";
		fullPause = false;
	}

	var px = pogo.frame.body.position[0]

	manageSectioning();

	if (pogo.frame.body.position[0] < 0 || pogo.frame.body.position[1] < -15) {
		gameOver = true;
		leftplay = false;
		pogo.frame.body.position[0] = Math.max(pogo.frame.body.position[0], -2)
		pogo.frame.body.position[1] = Math.max(pogo.frame.body.position[1], -15)
	}
	// Clear the canvas
	// ctx.clearRect(0, 0, w, h);


	if (colorful) {
		ctx.fillStyle = color.sky;
	} else {
		ctx.fillStyle = "#FFFFFF"
	}

	ctx.fillRect(0, 0, w, h);
	// ctx.fill()


	// Transform the canvas
	// Note that we need to flip the y axis since Canvas pixel coordinates
	// goes from top to bottom, while physics does the opposite.
	var xdelta = (Math.max(pogo.frame.body.position[0], w / 50 / 2) + xscroll) * 50 % secwidth
	for (var i = 0; i < clouds.length; i++) {
		clouds[i].xoffset = xdelta;
	}

	var ysold = yscroll;


	if (px >= w / 50 / 2) {
		xscroll = -pogo.frame.body.position[0]
	}
	v = pogo.frame.body.position[1] - yscroll

	if (Math.abs(v) > 0.35) {
		lerpval = 0.015
	} else {
		lerpval = 0.01
	}

	if (v < -0.2) {
		lerpval = 0.0325
	}
	yscroll = v * lerpval + yscroll

	progress = distToTime(score + pogo.frame.body.position[0] - w / 50 / 2) // half days

	drawSunAndMoon();

	fadeColors(progress)

	if (!addedClouds && progress > 3) {
		for (var i = 0; i < cloudCnt; i++) {
			clouds.push(new Cloud(Math.random() * w, (h / 2 - 20 - h / (1.75 * 50) - 10) * Math.random() - 10, Math.random() * (cloudSpeedDef - cloudSpeedMin) + cloudSpeedMin, w, h, i + cloudCnt))
		}
		addedClouds = true
	}

	if (filtersEnabled) {
		if (Math.floor(progress) == 3 || Math.floor(progress) == 5 || progress >= 7) {
			if (!cloudsDark) {
				offscreenContext.fillStyle = "rgba(255, 255, 255, 0)"
				offscreenContext.fillRect(0, 0, 300, 300)

				offscreenContext.filter = "brightness(50%)"

				offscreenContext.shadowBlur = 7;
				offscreenContext.shadowColor = "black";
				offscreenContext.font = cloudSize + "px FontAwesome";
				offscreenContext.globalAlpha = "0.7"
				offscreenContext.fillStyle = "#ffffff";
				// offscreenContext.textAlign = "left";
				offscreenContext.fillText("\uf0c2", 0, 80)

				cloudsDark = true;
			}
		} else {
			if (cloudsDark) {
				offscreenContext.fillStyle = "rgba(255, 255, 255, 0)"
				offscreenContext.fillRect(0, 0, 300, 300)

				offscreenContext.filter = "none"

				offscreenContext.shadowBlur = 7;
				offscreenContext.shadowColor = "black";
				offscreenContext.font = cloudSize + "px FontAwesome";
				offscreenContext.globalAlpha = "0.7"
				offscreenContext.fillStyle = "#ffffff";
				// offscreenContext.textAlign = "left";
				offscreenContext.fillText("\uf0c2", 0, 80)

				cloudsDark = false;
			}
		}
	}

	if (progress > 3) {
		currentRainAmnt = (progress < 4) ? rainAmnt : 0;
	}


	ctx.save();

	ctx.translate(w / 2, h / 2); // Translate to the center
	// ctx.scale(1/window.devicePixelRatio, 1/window.devicePixelRatio);
	ctx.scale(50, -50); // Zoom in and flip y axis

	for (var i = 0; i < clouds.length; i++) {
		clouds[i].yoffset = -(yscroll - ysold) * 50 * 1.75
	}

	ctx.translate(xscroll, -yscroll)
		// Draw all bodies
	drawpogo();
	//	var x = sectionA.h.body.position[0]
	//	var y = sectionA.h.body.position[1]
	var x = -1;
	var y = -1;

	ctx.beginPath();
	ctx.moveTo(x, -h / 50 * 7 / 4);

	var px = -xscroll //pogo.frame.body.position[0]

	var cdata = sectionA.d.slice(0, -1).concat(sectionB.d)

	for (var i = 0; i < cdata.length; i++) {
		var x1 = i * 2 //sectionA.h.shape.elementWidth
		if (x1 >= px - w / 50 / 2 - 1) {
			ctx.lineTo(x + x1, y + cdata[i]);
		}
		if (x1 > px + w / 50 / 2 + 2) {
			break;
		}
	}


	ctx.lineTo(x + cdata.length * 2 - 2, -h / 50 * 7 / 4)
	ctx.closePath()
	ctx.fillStyle = color.ground
	if (colorful) {
		ctx.fill();
	}
	ctx.stroke();

	///////////////////////////////////////////////
	var ah1 = sectionA.h1 != null
	var bh1 = sectionB.h1 != null

	ctx.fillStyle = "#555555"

	if (!(progress < 7 - 0.15 || Math.floor(progress) == 9)) {
		ctx.fillStyle = "#5555FF"
	}

	if (ah1) {
		ctx.beginPath();

		var startpos = sectionA.h1.body.position
		var dat = sectionA.h1verts

		ctx.moveTo(dat[0][0] + startpos[0], dat[0][1] + startpos[1]);
		for (var i = 1; i < dat.length - 1; i++) {
			var x1 = i * 2 //sectionA.h.shape.elementWidth
				//			if(startpos[0] + x1>=px-w/50/2-1) {
			ctx.lineTo(startpos[0] + dat[i][0], startpos[1] + dat[i][1]);
			//			}

			//			if(i==sectionA.d.length-1){
			//				ctx.lineTo(x+x1, -h/50)
			//			}
			//			if(startpos[0] + x1>px+w/50/2+2) {
			//				break;
			//			}
			//			i += 1;
		}


		ctx.lineTo(dat[dat.length - 1][0] + startpos[0], dat[dat.length - 1][1] + startpos[1])
			// ctx.lineTo(gameWidth/2,gameHeight/2);
			// ctx.lineTo(-gameWidth/2,gameHeight/2);
			// ctx.lineTo(-gameWidth/2,-gameHeight/2);
		ctx.closePath()
		if (colorful) {
			ctx.fill();
		}
		ctx.stroke();
	}

	if (bh1) {
		ctx.beginPath();


		var startpos = sectionB.h1.body.position
		var dat = sectionB.h1verts

		//		console.log(xstart)
		//		console.log("")
		//		console.log(dat.length)
		ctx.moveTo(dat[0][0] + startpos[0], dat[0][1] + startpos[1]);
		for (var i = 1; i < dat.length - 1; i++) {
			var x1 = i * 2 //sectionA.h.shape.elementWidth
				//			if(startpos[0] + x1>=px-w/50/2-1) {
			ctx.lineTo(startpos[0] + dat[i][0], startpos[1] + dat[i][1]);
			//			}

			//			if(i==sectionA.d.length-1){
			//				ctx.lineTo(x+x1, -h/50)
			//			}
			//			if(startpos[0] + x1>px+w/50/2+2) {
			//				break;
			//			}
			//			i += 1;
		}


		ctx.lineTo(dat[dat.length - 1][0] + startpos[0], dat[dat.length - 1][1] + startpos[1])
		ctx.closePath()

		if (colorful) {
			ctx.fill();
		}
		ctx.stroke();
	}
	///////////////////////////////////

	ctx.restore();
	for (var i = 0; i < clouds.length; i++) {
		clouds[i].update();
		clouds[i].render();
	}
	ctx.save();

	ctx.translate(w / 2, h / 2); // Translate to the center
	ctx.scale(50, -50); // Zoom in and flip y axis

	ctx.translate(xscroll, -yscroll)
	ctx.strokeStyle = "#000000"
	drawObstacles1(sectionA)
	drawObstacles1(sectionB)

	// Restore transform

	var idx = -1;
	var closest = -1;
	var A = true
	for (var i = 0; i < sectionA.o.length; i++) {
		if (sectionA.o[i].position[0] > px + w / 50 / 2) {
			if (sectionA.o[i].position[0] - px < closest || closest == -1) {
				closest = sectionA.o[i].position[0] - px
				idx = i
			}
		}
	}

	for (var i = 0; i < sectionB.o.length; i++) {
		if (sectionB.o[i].position[0] > px + w / 50 / 2) {
			if (sectionB.o[i].position[0] - px < closest || closest == -1) {
				closest = sectionB.o[i].position[0] - px
				idx = i
				A = false
			}
		}
	}

	try {
		//		var o = null
		if (A) {
			var o = sectionA.o[idx]
		} else {
			var o = sectionB.o[idx]
		}
		canvas_arrow(px + w / 50 / 2 - 0.3 - 1, o.position[1], px + w / 50 / 2 + 0.5 - 1 + 2 / 50, o.position[1])
		ctx.strokeStyle = "white"
		ctx.stroke()
		canvas_arrow(px + w / 50 / 2 - 0.3 - 1, o.position[1], px + w / 50 / 2 + 0.5 - 1, o.position[1])
		ctx.strokeStyle = "black"
		ctx.stroke()
	} catch (e) {
		//		console.log(e)
	}

	ctx.restore();

	drawControls()

	//
	var groundRGB = hexToRgb(color.ground)
	var groundLuma = Math.round((groundRGB.r * 0.2126 + groundRGB.g * 0.7152 + groundRGB.b * 0.0722 - 40) * 255 / 100)
	ctx.fillStyle = rgbToHex(255 - groundLuma, 255 - groundLuma, 255 - groundLuma)

	ctx.font = "20px Courier New";
	// if (groundLuma < 40) {
	// 	ctx.fillStyle = "#dddddd"
	// } else {
	// 	ctx.fillStyle = "#000000";
	// }
	ctx.textAlign = "left";

	//	var dist = (Math.floor(((-xscroll-((progress>2&&progress%2<=1)?4:0))%secwidth)%(rarity*2)))
	ctx.fillText("Next obstacle: " + Math.floor(closest), 10, h - 20);

	// ctx.fillStyle = "#000000";

	var skyRGB = hexToRgb(color.sky)
	var skyLuma = Math.round((skyRGB.r * 0.2126 + skyRGB.g * 0.7152 + skyRGB.b * 0.0722 - 30) * 255 / 90) - 10
		// skyLuma = Math.round((logistic(((skyLuma / 255) - 0.5) / 6) + 1) * 128)

	// if (skyLuma < 70) {
	// 	ctx.fillStyle = "#dddddd"
	// } else {
	// 	ctx.fillStyle = "#000000";
	// }

	ctx.fillStyle = rgbToHex(255 - skyLuma, 255 - skyLuma, 255 - skyLuma)
		// console.log(rgbToHex(255 - skyLuma, 255 - skyLuma, 255 - skyLuma))

	var daysRaw = progress / 2 + 0.25;


	// based on http://stackoverflow.com/a/13904120/6496271
	// in seconds
	var delta = daysRaw * 24 * 60 * 60;

	// calculate (and subtract) whole days
	var days = Math.floor(delta / 86400);
	delta -= days * 86400;

	// calculate (and subtract) whole hours
	var hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;

	// calculate (and subtract) whole minutes
	var minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;

	var timeTxt = "Day " + days + ", ";
	var hrsTxt = hours % 12 + 1 + "";
	timeTxt += ("0" + hrsTxt).substring(hrsTxt.length - 1) + ":";
	timeTxt += ("0" + minutes).substring(("" + minutes).length - 1) + " ";
	timeTxt += (hours > 11) ? "PM" : "AM"

	ctx.fillText(timeTxt, 10, 60);
	ctx.fillText(coinsCnt + '€', 10, 80)
	if (multi) {
		ctx.fillText('' + opponentScore, 10, 100)
	}
	// "Level/Half-Days: "+Math.round(progress*10000)/10000

	if (gameOver) {
		ctx.font = "30px Courier New";
		ctx.fillStyle = "red";
		ctx.textAlign = "center";
		if (!pendingquit) {
			endscore = score + Math.round(pogo.frame.body.position[0]) - Math.floor(w / 50 / 2);
			newtopscore = false
			if (endscore > topscore) {
				topscore = endscore
				newtopscore = true
				document.cookie = "topscore=" + endscore + "; expires=Tue, 19 Jan 2038 03:14:07 UTC";
			}

			pendingquit = true
			restarttimer = setTimeout(function () {
				//				if(leftplay) {
				//					leftplay=false;
				//					return;
				//				}
				gameOver = false

				if (mobile) {
					pendingquit = false
					initgame();
				}
			}, 1000 * 3);
		}

		var msg = "";
		if (newtopscore) {
			msg = "New High Score!\n"
		}
		ctx.fillText(msg + "Score: " + endscore, w / 2, h / 2 - 40);
	} else if (!pendingquit) {
		// ctx.font = "20px Courier New";
		// ctx.fillStyle = "black";
		ctx.textAlign = "left";
		ctx.fillText("High Score: " + topscore, 10, 25);
		scoreVal = (score - Math.floor(w / 50 / 2) + Math.round(pogo.frame.body.position[0]));
		ctx.fillText("Score: " + scoreVal, 10, 42);
		if (multiplayer) {
			sendData(JSON.stringify({
				scoreFrame: '' + (score - Math.floor(w / 50 / 2) + pogo.frame.body.interpolatedPosition[0]),
				scoreStick: '' + (score - Math.floor(w / 50 / 2) + pogo.stick.body.interpolatedPosition[0]),
				stickY: '' + pogo.stick.body.position[1],
				frameY: '' + pogo.frame.body.position[1],
				frameAngle: pogo.frame.body.angle,
				stickAngle: pogo.stick.body.angle,
				size: {
					frame: {
						height: pogo.frame.shape.height,
						width: pogo.frame.shape.width
					},
					stick: {
						height: pogo.stick.shape.height,
						width: pogo.stick.shape.width
					}
				}
			}));
		}
	} else {

		ctx.font = "30px Courier New";
		ctx.fillStyle = "red";
		ctx.textAlign = "center";
		ctx.fillText("Press Any Key to Continue...", w / 2, h / 2 - 40);
	}
}

var gyro = false;

function drawControls() {
	if (keyboard || gyro) return;
	var rect = canvas.getBoundingClientRect();

	ctx.save()
	if (fixedjoy && !nojoystick) {
		var jx = Math.round(jloc.x)
		var jy = Math.round(jloc.y);
		ctx.beginPath();
		ctx.arc(jx, jy, 50, 0, 2 * Math.PI, false);
		ctx.globalAlpha = 0.5;
		ctx.fillStyle = "#555555"
		ctx.fill()

		ctx.beginPath();
		ctx.arc(jx, jy, 10, 0, 2 * Math.PI, false);
		ctx.globalAlpha = 0.7;
		ctx.fillStyle = "#AAAAAA"
		ctx.fill()
	}
	ctx.restore()

	ctx.save()
	if (mousedrag && !nojoystick) {
		var mx1 = Math.round(lastmouse.x);
		var my1 = Math.round(lastmouse.y);
		var mx2 = Math.round(currentmouse.clientX);
		var my2 = Math.round(currentmouse.clientY);
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
	ctx.restore()
}

var cloudsVisible = true;

var rabbitElegible = false;

function fadeColors(progress) {
	var nightCol = hexToRgb(color.skynight)
	var dayCol = hexToRgb(color.skyday)

	var t = (progress + 0.5) % 2 // shift left a quarter day and make it between 0 and 2 for a full day
	var a = dayCol
	var b = nightCol

	if (t > 1) {
		var tmp = a;
		a = b;
		b = tmp;
	}

	var r = Math.round(lerp(a.r, b.r, 1 - t % 1));
	var g = Math.round(lerp(a.g, b.g, 1 - t % 1));
	var b = Math.round(lerp(a.b, b.b, 1 - t % 1));

	color.sky = rgbToHex(r, g, b)


	if (Math.floor(progress) >= 7 && Math.floor(progress) != 9) {
		return;
	}

	var skyold = color.sky

	var caveFade = 0.02

	if (progress > 2 && progress % 2 < 1 - caveFade) {
		color.sky = "#222222"
	}

	if (progress % 2 > 2 - caveFade) {
		a = hexToRgb(color.sky)
		b = hexToRgb("#222222")

		var val = 1 - (2 - progress % 2) * 1 / caveFade

		var r = Math.round(lerp(a.r, b.r, val));
		var g = Math.round(lerp(a.g, b.g, val));
		var b = Math.round(lerp(a.b, b.b, val));

		color.sky = rgbToHex(r, g, b)
	} else {
		if (progress > 2 && progress % 2 > 1 - caveFade) {
			a = hexToRgb("#222222")
			b = hexToRgb(color.sky)

			var val = 1 - (1 - progress % 2) * 1 / caveFade

			var r = Math.round(lerp(a.r, b.r, val));
			var g = Math.round(lerp(a.g, b.g, val));
			var b = Math.round(lerp(a.b, b.b, val));

			color.sky = rgbToHex(r, g, b)
		}
	}

	if (((progress > 2 && progress % 2 > 1) || (progress < 2)) && progress % 2 < 2 - caveFade) {
		color.sky = skyold
		color.ground = colordef.ground
	}

	// Ground

	if (progress > 2 && progress % 2 <= 1) {
		color.ground = "#555555"
		cloudsVisible = false;
		newlyVisible = false;
		rabbitElegible = false
	} else {
		rabbitElegible = true
	}

	if (progress % 2 > 2 - caveFade) {
		a = hexToRgb(colordef.ground)
		b = hexToRgb("#555555")

		var val = 1 - (2 - progress % 2) * 1 / caveFade

		var r = Math.round(lerp(a.r, b.r, val));
		var g = Math.round(lerp(a.g, b.g, val));
		var b = Math.round(lerp(a.b, b.b, val));

		color.ground = rgbToHex(r, g, b)
	} else {
		if (progress > 2 && progress % 2 > 1 - caveFade) {
			b = hexToRgb(colordef.ground)
			a = hexToRgb("#555555")

			var val = 1 - (1 - (progress % 2)) * 1 / caveFade

			var r = Math.round(lerp(a.r, b.r, val));
			var g = Math.round(lerp(a.g, b.g, val));
			var b = Math.round(lerp(a.b, b.b, val));

			newlyVisible = true
			cloudsVisible = true

			color.ground = rgbToHex(r, g, b)
		}
	}

	if (progress > 2 && progress % 2 > 1 && progress % 2 < 2 - caveFade) {
		color.ground = colordef.ground
		rabbitElegible = true;
		cloudsVisible = true;
		newlyVisible = false;
	}
}

var newtopscore = false

// from w3schools
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function drawObstacles() {
	var m = w / 50 / 2
	var d = m - 1
	var px = -xscroll
	var i1 = Math.floor((px + d) / (rarity * 2))

	for (var i = 0; i < obstacles.length; i++) {
		o = obstacles[i]
		if (Math.abs(o.position[0] - px) <= m) {
			ctx.beginPath();
			ctx.arc(o.position[0], o.position[1], 0.5, 0, 2 * Math.PI, false);
			ctx.stroke()
			ctx.strokeStyle = "#ffffff"
			ctx.beginPath();
			ctx.arc(o.position[0], o.position[1], 0.7, 0, 2 * Math.PI, false);
			ctx.stroke()
		}
	}




	//	if(px+d<obstacles[i].position[0]) {
	//		ctx.beginPath();
	//		ctx.arc(px+d, obstacles[i].position[1], 0.5, 0, 2 * Math.PI, false);
	//		ctx.strokeStyle = "#555555"
	//		ctx.stroke()
	try {
		canvas_arrow(px + d - 0.3, obstacles[i1].position[1], px + d + 0.5, obstacles[i1].position[1])
	} catch (e) {

	}
	//	}
	ctx.strokeStyle = "#000000"
}

var roboBunny = document.getElementById("roboBunnyImg")
var roboBunnyLegs = document.getElementById("roboBunnyImgLegs")

var rabbitMode = false;

var dragon = false

function drawpogo() {
	ctx.fillStyle = color.stick;
	if (!rabbitMode) {
		drawbox(pogo.stick)
		if (colorful) {
			ctx.fill();
		}
	}

	if (rabbitMode) {
		var ps = pogo.stick
		ctx.save();
		// ctx.opacity = '0.5'
		ctx.translate(ps.body.position[0], ps.body.position[1]); // Translate to the center of the box

		ctx.rotate(ps.body.angle + Math.PI); // Rotate to the box body frame

		ctx.drawImage(roboBunnyLegs, -ps.shape.width * 4, -ps.shape.height * 0.5, 2, 2 * 59 / 52)
		ctx.restore();
	}

	if (!rabbitMode) {
		ctx.fillStyle = color.body;

		drawbox(pogo.frame)
		if (colorful) {
			ctx.fill();
		}
	}

	if (rabbitMode) {
		var pf = pogo.frame
		ctx.save();
		// ctx.opacity = '0.5'
		ctx.translate(pf.body.position[0], pf.body.position[1]); // Translate to the center of the box

		ctx.rotate(pf.body.angle + Math.PI); // Rotate to the box body frame
		if (!dragon) {
			ctx.drawImage(roboBunny, -pf.shape.width * 2, -pf.shape.height - 1, 2, 2 * 76 / 41)
		} else {
			ctx.drawImage(roboBunny, -pf.shape.width * 3.5, -pf.shape.height - 0, 3, 5 * 1213 / 1861)
		}
		ctx.restore();
	}

	if (opponentScore != -1) {
		var scoreDiff = scoreVal - opponentScore
		if (Math.abs(scoreDiff) < w / 50 / 2 + 1) {
			ctx.fillStyle = color.stick;
			var exactFrame = score - Math.floor(w / 50 / 2) + pogo.frame.body.position[0];
			var exactStick = score - Math.floor(w / 50 / 2) + pogo.stick.body.position[0];

			drawboxGhost({
				x: opponentScoreData.scoreStick - exactStick + pogo.stick.body.position[0],
				y: opponentCoords.stick.y,
				angle: opponentScoreData.angle.stick,
				width: opponentScoreData.size.stick.width,
				height: opponentScoreData.size.stick.height
			})
			if (colorful) {
				ctx.fill();
			}
			ctx.fillStyle = color.body;
			drawboxGhost({
				x: opponentScoreData.scoreFrame - exactFrame + pogo.frame.body.position[0],
				y: opponentCoords.frame.y,
				angle: opponentScoreData.angle.frame,
				width: opponentScoreData.size.frame.width,
				height: opponentScoreData.size.frame.height
			})
			if (colorful) {
				ctx.fill();
			}
		}
	}
}

function drawbox(obj) {
	ctx.beginPath();
	// var inter = obj.body.interpolatedPosition[0]
	var normpos = obj.body.position[0]
	var x = normpos, //Math.abs(inter - normpos) > 0.1 ? normpos : inter, //interpolatedPosition[0],
		y = obj.body.interpolatedPosition[1];
	ctx.save();
	ctx.translate(x, y); // Translate to the center of the box
	ctx.rotate(obj.body.angle); // Rotate to the box body frame
	ctx.rect(-obj.shape.width / 2, -obj.shape.height / 2, obj.shape.width,
		obj.shape.height);
	ctx.stroke();
	ctx.restore();
}

function drawboxGhost(obj) {
	ctx.beginPath();
	var x = obj.x,
		y = obj.y;
	ctx.save();
	ctx.opacity = '0.5'
	ctx.translate(x, y); // Translate to the center of the box
	ctx.rotate(obj.angle); // Rotate to the box body frame
	ctx.rect(-obj.width / 2, -obj.height / 2, obj.width,
		obj.height);
	ctx.stroke();
	ctx.opacity = '1'
	ctx.restore();
}

function drawObstacles1(s) {
	for (var i = 0; i < s.o.length; i++) {
		o = s.o[i]
		ctx.strokeStyle = "white"
		ctx.beginPath();
		ctx.arc(o.position[0], o.position[1], 0.485, 0, 2 * Math.PI, false);
		ctx.stroke()
		ctx.strokeStyle = "orange"
		ctx.beginPath();
		ctx.arc(o.position[0], o.position[1], 0.525, 0, 2 * Math.PI, false);
		ctx.stroke()

		// Coins
		ctx.strokeStyle = "purple"
		ctx.beginPath();
		ctx.arc(o.position[0], o.position[1] + coinDist, 0.3, 0, 2 * Math.PI, false);
		ctx.stroke()

		ctx.strokeStyle = "black"
		ctx.beginPath();
		ctx.arc(o.position[0], o.position[1], 0.5, 0, 2 * Math.PI, false);
		ctx.stroke()


	}
}

// from http://stackoverflow.com/a/6333775
function canvas_arrow(fromx, fromy, tox, toy) {
	var headlen = 0.5; // length of head in pixels
	var angle = Math.atan2(toy - fromy, tox - fromx);
	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
	ctx.moveTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
	ctx.stroke()
}
