var twistval = 3.5;

var fixedjoy = true; //fixed joystick

var jloc = new Object();

var tiltoffset = 0

var keys = {
	left: 37,
	right: 39,
	up: 38,
	space: 32
}

function initControls() {
	jloc = {
		x: w*3/4,
		y: h*3/4
	};
	
	window.addEventListener("keydown", keydown, false);
	window.addEventListener("keyup", keyup, false);
	window.addEventListener("keypress", keypress, false);
	
	canvas.onmousedown = onmousedown
	
	canvas.addEventListener('touchstart', ontouchstart, false);        
	canvas.addEventListener('touchmove', ontouchmove, false);
	canvas.addEventListener('touchend', ontouchend, false);
	
//	if(mobile&&nojoystick) {
//		window.addEventListener('deviceorientation', handleOrientation);
//	}
	
	tiltoffset = window.screen.orientation.angle;
	
	console.log("Offset: ")
	console.log(window.screen.orientation.angle)
}

// Go to joysticktoggle for when the tilt event is added/removed

var mousedrag = false

var currentmouse = null

var lastmouse = {
	x: null,
	y: null
}

function handleOrientation(event) {
//	if(!nojoystick) {
//		window.removeEventListener('deviceorientation', handleOrientation);
//	}
	var y = -event.alpha+tiltoffset; // In degree in the range [-90,90]
//	console.log(y)
	y = Math.PI * 2 * y / 360 // Convert to radians
	
	var diff = getDifference(y, pogo.frame.body.angle)
	pogo.frame.body.angularVelocity = 3*diff;
}

function ontouchstart(e) {
	e.preventDefault();
	
	if(nojoystick) {
		pogo.spring.restLength = 1.25;
	    pogo.spring.applyForce();
		return;
	}
	
	pogo.spring.restLength = 0.25;
	pogo.spring.applyForce();
	
	currentmouse = {
		clientX: e.touches[0].clientX,
		clientY: e.touches[0].clientY
	}
	
	var angle = Math.atan2(currentmouse.clientX-lastmouse.x, currentmouse.clientY-lastmouse.y)
	pogo.frame.body.angularVelocity = 3*((angle-pogo.frame.body.angle));
}

function ontouchmove(e) {
	if(nojoystick) {
		return;
	}
	currentmouse = {
			clientX: e.touches[0].clientX,
			clientY: e.touches[0].clientY
	}
	e.preventDefault();
	if(lastmouse.x!=null) {
    	if (lastmouse.x!=e.touches[0].clientX||true) {
    		a = lastmouse.x-e.touches[0].clientX;
    		b = lastmouse.y-e.touches[0].clientY;
    		reacttocontrols()
    	} else {
    		pogo.frame.body.angularVelocity = 0;
    	}
    } else {
    	if(fixedjoy) {
    		lastmouse = {
        			x: jloc.x,
        			y: jloc.y
        	}
    	} else {
		    lastmouse = {
	    			x: e.touches[0].clientX,
	    			y: e.touches[0].clientY
	    	}
    	}
    }
    mousedrag = true
}

function ontouchend(e) {
	if(nojoystick) {
		pogo.spring.restLength = 0.25;
		pogo.spring.applyForce();
		return;
	}
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

function onmousedown() {
	pogo.spring.restLength = 0.25;
	pogo.spring.applyForce();
	if(!nojoystick) {
		  document.onmousemove = function(e) {
			  currentmouse = e
//		    e = e || event
//		    fixPageXY(e)  
		    // put ball center under mouse pointer. 25 is half of width/height
//		    self.style.left = e.pageX-25+'px' 
//		    self.style.top = e.pageY-25+'px' 
		    if(lastmouse.x!=null) {
		    	if (lastmouse.x!=e.clientX||true) {
		    		a = lastmouse.x-e.clientX;
		    		b = lastmouse.y-e.clientY;
		    		reacttocontrols()
		    	} else {
		    		pogo.frame.body.angularVelocity = 0;
		    	}
		    } else {
		    	if(fixedjoy) {
		    		lastmouse = {
		        			x: jloc.x,
		        			y: jloc.y
		        	}
		    	} else {
				    lastmouse = {
			    			x: e.clientX,
			    			y: e.clientY
			    	}
		    	}
		    }
		    mousedrag = true
		  }
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

function reacttocontrols() {
	var angle = Math.atan2(currentmouse.clientX-lastmouse.x, currentmouse.clientY-lastmouse.y)
	var diff = getDifference(angle, pogo.frame.body.angle)
	
	pogo.frame.body.angularVelocity = 3*diff;
//	console.log(pogo.frame.body.angle)
}

// Extremely useful!
// finds the smallest distance between two angles
// from https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
function getDifference(x, y) {
	  var a = x-y;
	  a = (function(i, j) {return i-Math.floor(i/j)*j})(a+Math.PI, Math.PI*2); // (a+180) % 360; this ensures the correct sign
	  a -= Math.PI;
	  return a;
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
	if (evt.keyCode == keys.up || evt.keyCode == keys.space) {
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
	
	if (evt.keyCode == keys.up || evt.keyCode == keys.space) {
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

function keypress(evt) {
	// alert(evt.keyCode)
	if([32, 37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
		evt.preventDefault();
    }
	
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