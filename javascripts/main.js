var debugtesting = false;

var coinsCnt = 0;

var gameOver = false;
var pendingquit = false;
var pause = false;

var home = true;

var restarttimer = null;

var multiplayer = false;

var lives = 3;

var tutorialm = false;

var leftplay = false;

var topscore = 0;

var score = 0;

var world, pogo;

var firstrh = true;

var angularVelocity = -0.25;

var opponentScore = -1;

var FRAME = 1,
	STICK = 2,
	GROUND = 4,
	OBSTACLE = 8;


// var oldcontrols = {
// 	nojoystick: null,
// 	fixedjoy: null,
// 	keyboard: null
// };



var controlMode = {
	KEYBOARD: 0,
	GYRO: 1,
	JOYSTICK: 2,
	UNFIXED_JOYSTICK: 3,
	modeRaw: this.KEYBOARD,
	mode: this.modeRaw,
	modeName: "Keyboard",
	get modeName() {
		switch (this.modeRaw) {
		case this.KEYBOARD:
			return "Keyboard";
		case this.GYRO:
			return "Gyro";
		case this.JOYSTICK:
			return "Joystick";
		case this.UNFIXED_JOYSTICK:
			return "Unfixed Joystick";
		default:
			return "Undefined";
		}

		return "Test";
	},
	set mode(val) {
		this.modeRaw = val;
		$(".dropdowntitle").html(this.modeName + ' <span class="caret">');
		$(".dropdowntitle").val(this.modeName);
		return val;
	},
	get mode() {
		return this.modeRaw;
	},
	get isJoystickVariant() {
		return this.modeRaw == this.JOYSTICK || this.modeRaw == this.UNFIXED_JOYSTICK;
	}
};

controlMode.mode = controlMode.KEYBOARD;

var nojoystick = false;

var heightfield;

var oldlabel = "";

/* Start of options */
var stiffness = 350,
	damping = 0.5,
	restLength = 0.25; // Options for spring

var rarity = 10; // obstacle rarity (must be even)

var pogomaterial = new p2.Material();
var icematerial = new p2.Material();

/* End of options */

var sectionA = {
	d: null,
	h: null,
	o: null
};

var sectionB = {
	d: null,
	h: null,
	o: null
};

function clearTimer() {
	if (restarttimer !== null) {
		clearTimeout(restarttimer);
	}
}

function changeOrientation() {
	// var canvas = document.getElementById("myCanvas");
	// if (canv.width != window.innerWidth) {
	// 	var tmp = canv.width;
	// 	document.getElementById("myCanvas").width = canv.height;
	// 	document.getElementById("myCanvas").height = tmp;
	// }

	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;

	setupjoy();

	secwidth = getsecwidth();
}

function fullscreen() {
	// document.getElementById("myCanvas").style.width = ''; //window.innerWidth + 'px';
	// document.getElementById("myCanvas").style.height = ''; //window.innerHeight + 'px';
	document.getElementById("myCanvas").width = window.innerWidth;
	document.getElementById("myCanvas").height = window.innerHeight;
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	// ctx = canvas.getContext("2d");
	secwidth = getsecwidth();
}

function resetHealth() {
	document.getElementById("health").style.animation = 'fadeinout 2s linear forwards';

	var elm = document.getElementById("health");
	elm.style.display = 'block';
	var newone = elm.cloneNode(true);
	elm.parentNode.replaceChild(newone, elm);

	document.getElementById("health").innerHTML =
		'<i class="fa fa-heart" aria-hidden="true"></i> ' +
		'<i id="h2" class="fa fa-heart" aria-hidden="true"></i> ' +
		'<i id="h3" class="fa fa-heart" aria-hidden="true"></i>';
}

function loseHeart() {
	if (pendingquit) {
		return;
	}
	document.getElementById("health").style.animation = 'fadeinout 2s linear forwards';
	var elm = document.getElementById("health");
	elm.style.display = 'block';
	var newone = elm.cloneNode(true);
	elm.parentNode.replaceChild(newone, elm);
	if (lives == 2) {
		document.getElementById("health").innerHTML =
			'<i class="fa fa-heart" aria-hidden="true"></i> ' +
			'<i id="h2" class="fa fa-heart" aria-hidden="true"></i> ' +
			'<i id="h3" class="fa fa-heart-o" aria-hidden="true"></i>';
	}

	if (lives == 1) {
		document.getElementById("health").innerHTML =
			'<i class="fa fa-heart" aria-hidden="true"></i> ' +
			'<i id="h2" class="fa fa-heart-o" aria-hidden="true"></i> ' +
			'<i id="h3" class="fa fa-heart-o" aria-hidden="true"></i>';
	}

	if (lives <= 0) {
		document.getElementById("health").innerHTML =
			'<i class="fa fa-heart-o" aria-hidden="true"></i> ' +
			'<i id="h2" class="fa fa-heart-o" aria-hidden="true"></i> ' +
			'<i id="h3" class="fa fa-heart-o" aria-hidden="true"></i>';
	}
}

function processopts() {
	saveopts();
	updatehelp();
	return;
}

function saveopts() {
	saveopts1(true);
}

function saveopts1(tutsave) {
	keyboard = false;
	switch ($(".dropdowntitle").val()) {
	case 'Joystick':
		controlMode.mode = controlMode.JOYSTICK;
		fixedjoy = true;
		nojoystick = false;
		break;
	case 'Unfixed Joystick':
		controlMode.mode = controlMode.UNFIXED_JOYSTICK;
		fixedjoy = false;
		nojoystick = false;
		break;
	case 'Gyro':
		controlMode.mode = controlMode.GYRO;
		nojoystick = true;
		break;
	case 'Keyboard':
		controlMode.mode = controlMode.KEYBOARD;
		keyboard = true;

	case '':
	default:
	}

	document.getElementById("modeHUD").innerHTML = "Mode: " + controlMode.modeName;

	//	if(tutsave) {
	//		oldcontrols = {
	//				nojoystick: nojoystick,
	//				fixedjoy: fixedjoy,
	//				keyboard: keyboard
	//		}
	//	}

	updatehelp();

	setupjoy();
}

var multi = false;
var conn;

var peerkey = 'k21h7zsvzls4te29';

var peer;

var seedVal;

var firstData = true;

var opponentCoords = {
	frame: {
		y: 0
	},
	stick: {
		y: 0
	}
};

var opponentScoreData = {
	scoreFrame: 0,
	scoreStick: 0,
	angle: {
		frame: 0,
		stick: 0
	},
	size: {
		frame: {
			height: 0,
			width: 0
		},
		stick: {
			height: 0,
			width: 0
		}
	}
};

function handleData(data) {
	// console.log(data)
	var obj = JSON.parse(data);

	opponentScoreData.scoreFrame = obj.scoreFrame;
	opponentScoreData.scoreStick = obj.scoreStick;
	opponentScoreData.angle.frame = obj.frameAngle;
	opponentScoreData.angle.stick = obj.stickAngle;

	opponentScoreData.size.frame.height = obj.size.frame.height;
	opponentScoreData.size.frame.width = obj.size.frame.width;
	opponentScoreData.size.stick.height = obj.size.stick.height;
	opponentScoreData.size.stick.width = obj.size.stick.width;

	opponentCoords.frame.y = obj.frameY;
	opponentCoords.stick.y = obj.stickY;

	opponentScore = Math.round(parseInt(obj.scoreFrame));
}

function onload() {

	// I think that this is from SO (I am not taking credit)
	var QueryString = function () {
		// This function is anonymous, is executed immediately and
		// the return value is assigned to QueryString!
		var query_string = {};
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			// If first entry with this name
			if (typeof query_string[pair[0]] === "undefined") {
				query_string[pair[0]] = decodeURIComponent(pair[1]);
				// If second entry with this name
			} else if (typeof query_string[pair[0]] === "string") {
				var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
				query_string[pair[0]] = arr;
				// If third or later entry with this name
			} else {
				query_string[pair[0]].push(decodeURIComponent(pair[1]));
			}
		}
		return query_string;
	}();

	if (QueryString.debug === "1") {
		openDebug();
	}

	setupControlSettings();

	if (QueryString.multi === "1") {
		multiplayer = true;
		multi = true;

		var id = '' + Math.round(Math.random() * 10000);

		peer = new Peer(id, {
			key: peerkey,
			secure: false,
			debug: 3
		});

		if (QueryString.leader === "1") {
			var otherid = prompt("What is you're opponent's id number?");
			console.log("Other id: " + otherid);

			conn = peer.connect('' + otherid);
			conn.on('open', function () {
				// Receive messages
				conn.on('data', function (data) {
					// console.log('Received', data);
					handleData(data);
					// opponentScore = parseInt(data);
				});

				// Send messages
				// conn.send('Hello!');
				// seedVal = Math.round(Math.random() * 1000);
				conn.send('' + 10101);
			});

			seedVal = parseInt(otherid) / 10000;
		} else {
			peer.on('connection', function (conn1) {
				conn = conn1;
				conn.on('data', function (data) {
					// Will print 'hi!'
					// console.log(data);
					if (firstData) {
						firstData = false;
						// seedVal = parseInt(data)
					} else {
						handleData(data);
					}
				});
			});

			alert("Give this id number to the leader: " + id);
			seedVal = parseInt(id) / 10000;
		}
	} else {
		seedVal = Math.random() * 10;
	}

	if (QueryString.seed) {
		// seedVal = parseInt(QueryString.seed)
		seedVal = 999;
	}

	$('#keyslider').rangeslider({

		// Feature detection the default is `true`.
		// Set this to `false` if you want to use
		// the polyfill also in Browsers which support
		// the native <input type="range"> element.
		polyfill: false,

		// Default CSS classes
		rangeClass: 'rangeslider',
		disabledClass: 'rangeslider--disabled',
		horizontalClass: 'rangeslider--horizontal',
		verticalClass: 'rangeslider--vertical',
		fillClass: 'rangeslider__fill',
		handleClass: 'rangeslider__handle',

		// Callback function
		onInit: function () {
			sen = getCookie("keysensitivity");
			if (sen === "") {
				document.cookie = "keysensitivity=100; expires=Tue, 19 Jan 2038 03:14:07 UTC";
				sen = "100";
			}
			keysensitivityval = parseInt(sen);
			$(this).val(keysensitivityval).change();
		},

		// Callback function
		onSlide: function (position, value) {
			keysensitivityval = value;
		},

		// Callback function
		onSlideEnd: function (position, value) {
			keysensitivityval = value;
		}
	});

	$('input[type="range"]').val(keysensitivityval).change();

	// $('input[type="range"]').rangeslider('update', true);

	window.onbeforeunload = function () {
		document.cookie = "coinsCnt=" + coinsCnt + "; expires=Tue, 19 Jan 2038 03:14:07 UTC";
		document.cookie = "keysensitivity=" + keysensitivityval + "; expires=Tue, 19 Jan 2038 03:14:07 UTC";
		return null;
	};

	coinsCnt = parseInt(getCookie("coinsCnt")) || 0;

	$(".controls").clone().appendTo(".controlsdiv");

	$(".helptxtdiv").clone().appendTo(".tutcontrolsdiv");

	$('.dropdown-menu li a').on('click', function () {
		//$('.dropdowntitle').html($(this).find('a').html()+' <span class="caret">');
		$(".dropdowntitle").html($(this).text() + ' <span class="caret">');
		$(".dropdowntitle").val($(this).text());
		processopts();
	});

	//	$('.savesel').on('click', function() {
	//	    console.log("Hi!");
	//	    alert("Hi")
	//	});
	fullscreen();
	window.addEventListener("orientationchange", function () {
		// Announce the new orientation number
		//		  alert(window.orientation);
		changeOrientation();
	}, false);

	window.onresize = function onresize() {
		w = canvas.width = window.innerWidth;
		h = canvas.height = window.innerHeight;

		document.getElementById("myCanvas").style.width = ''; //window.innerWidth + 'px';
		document.getElementById("myCanvas").style.height = ''; //window.innerHeight + 'px';

		ctx = canvas.getContext("2d");
		ctx.lineWidth = 0.05;

		secwidth = getsecwidth();
	};
}

function init() {
	gameOver = false;
	pendingquit = false;

	console.log("Mobile or tablet: " + mobile);

	//	if(mobile&&!fixedjoy) {
	////		togglefixedjoy() //fix the joystick location on mobile in case not by default
	//
	//	}

	nojoystick = true;
	keyboard = !mobile;

	if (mobile) {
		gyro = true;
	}

	if (!mobile) {
		$(".dropdowntitle").html('Keyboard' + ' <span class="caret">');
		$(".dropdowntitle").val('Keyboard');
		//processopts()
	} else {
		document.getElementById("modeHUD").innerHTML = "Mode: Gyro";
	}

	$("#errortxt").html += "" + nojoystick;

	updatehelp();

	if (mobile) {
		elems = document.getElementsByClassName("dtop");
		for (var i = 0; i < elems.length; i++) {
			elems[i].style.display = "none";
		}

		if (nojoystick) {
			$(".keyboard").hide();
			$(".dropdowntitle").html("Gyro" + ' <span class="caret">');
			$(".dropdowntitle").val("Gyro");
		}
	}

	// Init canvas
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;

	filtersEnabled = (typeof ctx.filter != "undefined");

	noise.seed(10 + 0 * seedVal);
	// Init p2.js

	if (!tutorialm) {
		initgamepartial();
	} else {
		inittut();
	}
	initControls();
}

var secnum = 0;
var secwidth = null;
var padding = 2;

var coinDist = 1;

function copysec(s) {
	var obstacles = [];
	//	var idx = 0
	for (var idx = 0; idx < s.o.length; idx++) {
		var circleShape = new p2.Circle({
			radius: 0.5,
			sensor: true
		});
		var circleBody = new p2.Body({
			mass: 1,
			position: s.o[idx].position,
			fixedX: s.o[idx].fixedX,
			fixedY: s.o[idx].fixedY,
			velocity: s.o[idx].velocity
		});

		var circleShapeCoin = new p2.Circle({
			radius: 0.3,
			sensor: true
		});

		circleBody.addShape(circleShape);
		circleBody.addShape(circleShapeCoin, [0, coinDist]);
		circleShape.collisionGroup = OBSTACLE;
		circleShape.collisionMask = FRAME | STICK;
		circleShapeCoin.collisionGroup = OBSTACLE;
		circleShapeCoin.collisionMask = FRAME | STICK;
		obstacles.push(circleBody);

		//	        idx+=1
	}

	var heightfield = new Object();
	heightfield.shape = new p2.Heightfield({
		heights: s.d,
		elementWidth: 2
	});
	heightfield.body = new p2.Body({
		position: s.h.body.position
	});
	heightfield.shape.collisionGroup = GROUND;
	heightfield.shape.collisionMask = FRAME | STICK;

	heightfield.body.addShape(heightfield.shape);

	var h1 = null;
	if (s.h1 != null) {
		h1 = new Object();
		h1.body = new p2.Body({
			position: s.h1.body.position
		});
		h1.body.fromPolygon(JSON.parse(JSON.stringify(s.h1verts)));
		for (var i = 0; i < h1.body.shapes.length; i++) {
			h1.body.shapes[i].collisionGroup = GROUND;
			h1.body.shapes[i].collisionMask = FRAME | STICK;
			h1.body.shapes[i].material = icematerial;
		}
	}

	return {
		d: s.d,
		h: heightfield,
		h1: h1,
		h1verts: s.h1verts,
		o: obstacles,
		od: s.od,
		inverts: s.inverts
	};
}

function changenum(s1, num, oldnum) {
	var s = copysec(s1);
	s.h.body.position[0] += (num - oldnum) * secwidth;
	for (var i = 0; i < s.o.length; i++) {
		s.o[i].position[0] += (num - oldnum) * secwidth;
		s.o[i].velocity = [0, 0];
	}

	if (s.h1 != null) {
		s.h1.body.position[0] += (num - oldnum) * secwidth;
	}
	return s;
}

function caveMouthSigmoid(x) {
	return -2 * (x / (1 + Math.abs(x))) - 1;
}

var caveDepth = 4;
var caveHeight = 5;

function generateSection() {
	var data = [];

	var ceilverts = [];
	var startedceil = false;
	var ceilx = null;
	var ceily = null;
	var ice = false;
	for (var i = 0; i <= secwidth / 2; i++) {
		var v = (i + secnum * secwidth / 2) / 10;

		var value = noise.simplex2(v, 0) * 1.75;
		var lvl = distToTime(secnum * secwidth + i * 2);
		if (lvl > 2) {
			if (lvl % 2 < 1 && (Math.floor(lvl) < 7 || Math.floor(lvl) == 9)) { // Cave
				value = value / 1.75; //Make terrain smoother
				var ychange = null;
				if (lvl % 1 <= 0.5) {
					var x = (lvl % 1) * 4 - 1;
					ychange = caveMouthSigmoid(x) * caveDepth;
				}

				if (lvl % 1 > 0.5) {
					var x = ((lvl - 0.5) % 1) * 4 - 1;
					ychange = caveMouthSigmoid(-x) * caveDepth;
				}

				value += ychange;

				if (ychange < -caveDepth / 2 || startedceil) {
					var y = value + caveHeight;
					if (!startedceil) {
						ceilx = i * 2;
						ceily = y;
						startedceil = true;

						ceilverts.push([5, 2 + 3]);
						ceilverts.push([0, 5 + 3]);
					}
					ceilverts.push([i * 2 - ceilx, y - ceily]);

					if ((i % rarity == rarity - 2) && i != secwidth / 2) {
						if (Math.random() > 0.5) {
							value += Math.random() * 2;
						} else {
							ceilverts.push([i * 2 - ceilx, y - ceily - Math.random() * 1.5 - 1]);
						}
					}
				}
			} else {
				if (lvl >= 7 && lvl < 9) {
					if (!startedceil) {
						value = Math.max(value, 1);
						ceilx = i * 2;
						ceily = -9;
						startedceil = true;
						ice = true;
						ceilverts.push([0, 0]);
					} else {
						value = -2;
					}
					ceilverts.push([i * 2 - ceilx, 1 - ceily]);
				}
			}
		}
		data.push(value);
	}

	var heightfield = new Object();
	heightfield.shape = new p2.Heightfield({
		heights: data,
		elementWidth: 2
	});
	heightfield.body = new p2.Body({
		position: [-1, -1]
	});
	heightfield.shape.collisionGroup = GROUND;
	heightfield.shape.collisionMask = FRAME | STICK;

	heightfield.body.addShape(heightfield.shape);

	if (startedceil) {
		if (!ice) {
			ceilverts.push([ceilverts[ceilverts.length - 1][0], ceilverts[ceilverts.length - 1][1] + 5 + 3]);
		} else {
			ceilverts.push([ceilverts[ceilverts.length - 1][0], 0]);
		}
		//		ceilverts.reverse()
		var h1 = new Object();
		h1.body = new p2.Body({
			position: [ceilx - 1, ceily - 1]
		});
		h1.body.fromPolygon(JSON.parse(JSON.stringify(ceilverts)));
		//		console.log(h1.body.fromPolygon(JSON.parse(JSON.stringify(ceilverts))))
		//		console.log(h1.body)
		for (var i = 0; i < h1.body.shapes.length; i++) {
			h1.body.shapes[i].collisionGroup = GROUND;
			h1.body.shapes[i].collisionMask = FRAME | STICK;
			//			if(ice) {
			h1.body.shapes[i].material = icematerial;
			//			}
		}
	}

	var od = [];
	var y = null;
	var obstacles = [];
	for (var i = 1; i < data.length; i++) {
		if (i % rarity == 0) {
			var lvl = Math.floor(distToTime(secnum * secwidth + i * 2));
			// if (Math.random() > 0.5) {
			y = data[i] + Math.random() * 5;
			// } else {
			// 	y = data[i] + 5 - Math.random() * 2;
			// }

			if (lvl == 0) {
				y += 15;
			}
			if (lvl > 2 && lvl < 3) {
				y -= 20;
			}

			od.push(y);
			var circleShape = new p2.Circle({
				radius: 0.5,
				sensor: true
			});
			var circleBody = new p2.Body({
				mass: 1,
				position: [i * 2, y],
				fixedX: true,
				fixedY: true
			});

			var circleShapeCoin = new p2.Circle({
				radius: 0.3,
				sensor: true
			});

			circleBody.addShape(circleShape);
			circleBody.addShape(circleShapeCoin);
			circleShape.collisionGroup = OBSTACLE;
			circleShape.collisionMask = FRAME | STICK;
			circleShapeCoin.collisionGroup = OBSTACLE;
			circleShapeCoin.collisionMask = FRAME | STICK;
			obstacles.push(circleBody);
		}
	}

	secnum += 1;

	if (h1 != null && ceilverts.length < 1) {
		ceilverts = [
			[-1, 1],
			[-1, 0],
			[1, 0],
			[1, 1],
			[0.5, 0.5]
		];
	}

	return {
		d: data,
		h: heightfield,
		h1: h1,
		h1verts: ceilverts,
		o: obstacles,
		od: od,
		inverts: new Array(obstacles.length).fill(false)
	};
}

function addSection(s) {
	world.addBody(s.h.body);
	for (var i = 0; i < s.o.length; i++) {
		world.addBody(s.o[i]);
	}

	if (s.h1 != null) {
		world.addBody(s.h1.body);
	}

	//	if(s.cm!=null) {
	//		world.addContactMaterial(s.cm);
	//	}
}

function removeSection(s) {
	world.removeBody(s.h.body);
	for (var i = 0; i < s.o.length; i++) {
		world.removeBody(s.o[i]);
	}

	if (s.h1 != null) {
		world.removeBody(s.h1.body);
	}

	//	if(cm!=null) {
	//		world.removeContactMaterial(cm);
	//	}
}

function getsecwidth() {
	var canvaswidth = Math.ceil(w / 50 + padding); //Get the ceil of the canvas width (along with extra padding) in game units
	var x = Math.ceil(canvaswidth / rarity) * rarity; // round so that distance between obstacles is consistent between sections
	return x;
}

//from http://stackoverflow.com/a/3261380
function isEmpty(str) {
	return (!str || 0 === str.length);
}

var lvlCnt = 10;

var lvl1length = 100;

function distToTime(dist) { // in half days
	return lvlCnt * (1 - Math.pow(1 - 1 / lvlCnt, dist / lvl1length));
}

function initgame() {
	resetHealth();
	initgamepartial();
}

function initgamepartial() {
	orientationData = new FULLTILT.DeviceOrientation({
		'type': 'game'
	});
	initRender();
	cookie = getCookie("topscore");
	if (isEmpty(cookie)) {
		document.cookie = "topscore=0; expires=Tue, 19 Jan 2038 03:14:07 UTC;";
	} else {
		topscore = parseInt(cookie);
	}

	score = 0;
	secnum = 0;
	lives = 3;
	// resetHealth();
	gameOver = false;
	pendingquit = false;
	world = new p2.World({
		gravity: [0, -7]
	});

	world.defaultContactMaterial.friction = 100;
	world.defaultContactMaterial.restitution = 0.1;

	world.addContactMaterial(new p2.ContactMaterial(icematerial, pogomaterial, {
		restitution: 0,
		friction: 25
	}));

	var pogox = w / 50 / 2;

	pogo = {
		stick: new Object(),
		frame: new Object(),
		spring: null
	};

	pogo.stick.shape = new p2.Box({
		width: 0.25,
		height: 1.6,
		material: pogomaterial
	});

	pogo.stick.body = new p2.Body({
		mass: 0.25,
		//		damping: 0.2,
		position: [pogox, 2.75],
		angularVelocity: angularVelocity,
		velocity: [5, 0]
	});

	pogo.frame.shape = new p2.Box({
		width: 0.5,
		height: 1.5,
		material: pogomaterial
	});

	pogo.frame.body = new p2.Body({
		mass: 3,
		position: [pogox, 3],
		angularVelocity: angularVelocity,
		velocity: [5, 0]
	});

	pogo.frame.body.addShape(pogo.frame.shape);
	pogo.stick.body.addShape(pogo.stick.shape);

	world.addBody(pogo.frame.body);
	world.addBody(pogo.stick.body);

	var c1 = new p2.PrismaticConstraint(pogo.frame.body, pogo.stick.body, {
		localAnchorA: [0, 0.5],
		localAnchorB: [0, 0.5],
		localAxisA: [0, 1],
		disableRotationalLock: true,
	});
	var c2 = new p2.PrismaticConstraint(pogo.frame.body, pogo.stick.body, {
		localAnchorA: [0, 0],
		localAnchorB: [0, 1],
		localAxisA: [0, 1],
		disableRotationalLock: true,
	});
	c1.setLimits(-1, -0.4);
	world.addConstraint(c2);
	world.addConstraint(c1);

	pogo.spring = new p2.LinearSpring(pogo.frame.body, pogo.stick.body, {
		restLength: restLength,
		stiffness: stiffness,
		damping: damping,
		localAnchorA: [0, 0],
		localAnchorB: [0, 0],
	});

	world.addSpring(pogo.spring);

	secwidth = getsecwidth();

	sectionA = generateSection();
	sectionB = changenum(generateSection(), 1, 0);

	addSection(sectionA);
	addSection(sectionB);

	// Setup Collisions

	pogo.frame.shape.collisionGroup = FRAME;
	pogo.stick.shape.collisionGroup = STICK;

	pogo.frame.shape.collisionMask = GROUND | OBSTACLE;
	pogo.stick.shape.collisionMask = GROUND | OBSTACLE;

	world.on("postStep", updateObstacles);

	world.on("beginContact", function (event) {
		if (!gameOver && pendingquit) {
			return;
		}

		if (event.bodyA == pogo.frame.body || event.bodyB == pogo.frame.body) {
			var h = event.bodyA == sectionA.h.body || event.bodyB == sectionA.h.body;
			h = h || event.bodyA == sectionB.h.body || event.bodyB == sectionB.h.body;
			if (!h) {
				if (rabbitElegible && !rabbitMode && !event.shapeA.sensor && !event.shapeB.sensor) {
					console.log(event)
					rabbitMode = 1;
					lives = 3;
					icematerial.friction *= 2;
					alert("Welcome. You found my *easter egg* (pun intended)! Don't tell others how to get the rabbit but be sure to show them the result!")
				} else {
					if (debugtesting) {
						return;
					}

					var isCoin = false
					if (event.shapeA == pogo.frame.shape) {
						console.log(event.shapeB)
						isCoin = event.shapeB.radius == 0.3;
					} else {
						console.log(event.shapeA)
						isCoin = event.shapeA.radius == 0.3;
					}
					if (isCoin) {
						// is coin
						coinsCnt++;
						// alert("coin!");
						return;
					} else {
						// is obstacle
						lives -= 1;
						loseHeart();
					}
				}
			} else {
				if (debugtesting) {
					return;
				}
				lives = 0;
				loseHeart();
			}
			if (lives <= 0 || h) {
				gameOver = true;
				leftplay = false;
			}
		}
	});
}

function updateObstacles() {
	var t = distToTime((secnum - 1) * secwidth);
	//	console.log(t)
	if (t > 3) {
		if (t < 5) {
			for (var i = 0; i < sectionA.o.length; i++) {
				sectionA.o[i].fixedY = false;
				sectionA.o[i].velocity[1] = 2.5 * Math.sin(world.time * 3);
			}


			for (var i = 0; i < sectionB.o.length; i++) {
				sectionB.o[i].fixedY = false;
				sectionB.o[i].velocity[1] = 2.5 * Math.sin(world.time * 3);
			}
		} else {
			var calc = function (b, a, invert) {
				var v = [a[0] - b[0], a[1] - b[1]];
				var mag = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
				if (mag <= 0) {
					console.log("zero mag! target reached!");
					return [0, 0];
				}
				var speed = Math.sin((Math.min(mag, 9) / 10) * Math.PI);
				speed *= 3; // Top Speed
				speed = Math.max(speed, 1); // Min speed
				if (speed / mag <= 0) {
					console.log("HELP ME!!!!!");
				}
				speed *= invert ? -1 : 1;
				v = [v[0] * speed / mag, v[1] * speed / mag]; //Normalize then scale
				//				console.log(v)
				return v;
			};

			//				console.log("A")
			for (var i = 0; i < sectionA.o.length; i++) {
				//					sectionA.o[i].fixedX = false;
				//					sectionA.o[i].fixedY = false;
				var pos = sectionA.o[i].position;
				var ppos = pogo.stick.body.position;

				sectionA.o[i].velocity = calc(pos, ppos, sectionA.inverts[i]);
			}


			//				console.log("B")
			for (var i = 0; i < sectionB.o.length; i++) {
				//					sectionB.o[i].fixedX = false;
				//					sectionB.o[i].fixedY = false;
				var ppos = sectionB.o[i].position;
				var pos = pogo.stick.body.position;

				sectionB.o[i].velocity = calc(pos, ppos, sectionB.inverts[i]);
			}
		}
	}
}
