function initControls() {
	window.addEventListener("keydown", keydown, false);
	window.addEventListener("keyup", keyup, false);
	window.addEventListener("keypress", keypress, false);
	
	canvas.onmousedown = onmousedown
	
	canvas.addEventListener('touchstart', ontouchstart, false);        
	canvas.addEventListener('touchmove', ontouchmove, false);
	canvas.addEventListener('touchend', ontouchend, false);
}

var twistval = 3.5;

var mousedrag = false

var currentmouse = null

var lastmouse = {
	x: null,
	y: null
}

function ontouchstart(e) {
	e.preventDefault();
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
	up: 38,
	space: 32
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