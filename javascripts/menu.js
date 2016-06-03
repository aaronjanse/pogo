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

function toggleColor() {
	colorful=!colorful;
	document.getElementById("coltoggle").innerHTML = (colorful ? "Disable" : "Enable") + " colors";
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