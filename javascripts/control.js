var twistval = 2.6; //3.5;

var fixedjoy = true; //fixed joystick

var jloc = new Object();

var tiltoffset = 0

var orientationData;

var keyboard = false;

var keys = {
    left: 37,
    right: 39,
    up: 38,
    space: 32
};

var keyspressed = {
    left: false,
    right: false,
    up: false,
    space: false
};

function initControls() {
    setupjoy();

    window.addEventListener("keydown", keydown, false);
    window.addEventListener("keyup", keyup, false);
    window.addEventListener("keypress", keypress, false);

    canvas.onmousedown = onmousedown;

    canvas.addEventListener('touchstart', ontouchstart, false);
    canvas.addEventListener('touchmove', ontouchmove, false);
    canvas.addEventListener('touchend', ontouchend, false);

    //	if(mobile&&nojoystick) {
    //		window.addEventListener('deviceorientation', handleOrientation);
    //	}

    //tiltoffset = window.screen.orientation.angle;
    tiltoffset = 0;

    //console.log("Offset: ");
    //console.log(window.screen.orientation);

    if (!window.DeviceOrientationEvent) {
        console.log("DeviceOrientation is not supported");
        nojoystick = false;
        setupjoy();
    }

    try {
        if (nojoystick) {
            var orientationData = new FULLTILT.DeviceOrientation({
                'type': 'game'
            });
            orientationData.start(function () {
                if (!nojoystick) {
                    return;
                }
                // DeviceOrientation updated

                //			  var matrix = orientationData.getScreenAdjustedMatrix();
                var angle = orientationData.getScreenAdjustedEuler().alpha;
                if (angle) {

                } else {
                    console.log("DeviceOrientation is not supported");
                    nojoystick = false
                    setupjoy()
                    return
                }
                //			console.log("AlphaBefore: "+angle)
                if (angle > 180) {
                    angle = angle - 360;
                }
                //			angle-=180
                angle = Math.PI * angle / 180;
                //			console.log("Alpha: "+angle)

                var diff = getDifference(angle, pogo.frame.body.angle);

                pogo.frame.body.angularVelocity = 3 * diff;
                //			console.log("Beta: "+angles.beta)
                //			console.log("Gamma: "+angles.gamma)
                //			document.getElementById("alpha").innerHTML=""+angles.alpha
                //			document.getElementById("beta").innerHTML=""+angles.beta
                //			document.getElementById("gamma").innerHTML=""+angles.gamma
                // Do something with rotation matrix `matrix`...
            });
        }
    } catch (e) {
        console.log("DeviceOrientation library is not supported");
        nojoystick = false;
        setupjoy()
    }

    //	tiltoffset=90
    //
    //	document.getElementById("myCanvas").webkitRequestFullscreen();
    ////	screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
    //
    //	var lockFunction =  window.screen.orientation.lock;
    //	if (lockFunction.call(window.screen.orientation, 'landscape')) {
    //	           console.log('Orientation locked')
    //	        } else {
    //	            console.error('There was a problem in locking the orientation')
    //	        }

    //	screen.lockOrientation("landscape-primary")
    //	screen.orientation.lock('landscape-primary').then(null, function(error) {
    //		document.exitFullscreen();
    //	});
}

function setupjoy() {
    if (fixedjoy) {
        jloc = {
            x: w * 3 / 4,
            y: h * 3 / 4
        };

        lastmouse = {
            x: jloc.x,
            y: jloc.y
        }
    }
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
    var y = -event.gamma + tiltoffset; // In degree in the range [-90,90]
    console.log(y)
    y = Math.PI * 2 * y / 360 // Convert to radians
    var diff = getDifference(y, pogo.frame.body.angle)
    pogo.frame.body.angularVelocity = 3 * diff;
}

function ontouchstart(e) {
    e.preventDefault();

    if (nojoystick) {
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

    var angle = Math.atan2(currentmouse.clientX - lastmouse.x, currentmouse.clientY - lastmouse.y)
    pogo.frame.body.angularVelocity = 3 * ((angle - pogo.frame.body.angle));
}

function ontouchmove(e) {
    if (nojoystick) {
        return;
    }
    currentmouse = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
    }
    e.preventDefault();
    if (lastmouse.x != null) {
        if (lastmouse.x != e.touches[0].clientX || true) {
            a = lastmouse.x - e.touches[0].clientX;
            b = lastmouse.y - e.touches[0].clientY;
            reacttocontrols()
        } else {
            pogo.frame.body.angularVelocity = 0;
        }
    } else {
        if (fixedjoy) {
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
    if (nojoystick) {
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
    if (!nojoystick) {
        document.onmousemove = function (e) {
            currentmouse = e
            if (lastmouse.x != null) {
                if (lastmouse.x != e.clientX || true) {
                    a = lastmouse.x - e.clientX;
                    b = lastmouse.y - e.clientY;
                    reacttocontrols()
                } else {
                    pogo.frame.body.angularVelocity = 0;
                }
            } else {
                if (fixedjoy) {
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
    this.onmouseup = function () {
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
    var angle = Math.atan2(currentmouse.clientX - lastmouse.x, currentmouse.clientY - lastmouse.y)
    var diff = getDifference(angle, pogo.frame.body.angle)

    pogo.frame.body.angularVelocity = 3 * diff;
}

// Extremely useful!
// finds the smallest distance between two angles
// from https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
function getDifference(x, y) {
    var a = x - y;
    a = (function (i, j) {
        return i - Math.floor(i / j) * j
    })(a + Math.PI, Math.PI * 2); // (a+180) % 360; this ensures the correct sign
    a -= Math.PI;
    return a;
}

function keydown(evt) {
    if ([32, 37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
        evt.preventDefault();
    }

    if (evt.keyCode == keys.up || evt.keyCode == 87) {
        keyspressed.up = true
    }
    if (evt.keyCode == keys.space  || evt.keyCode == 87) {
        keyspressed.space = true
    }
    if (evt.keyCode == keys.left || evt.keyCode == 65) {
        keyspressed.left = true
    }
    if (evt.keyCode == keys.right || evt.keyCode == 68) {
        keyspressed.right = true
    }



    //	return !(evt.keyCode == 32 && (evt.target.type != 'text' && evt.target.type != 'textarea'));
}

function keyup(evt) {
    //	if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    //        e.preventDefault();
    //    }

    if (evt.keyCode == keys.up || evt.keyCode == 87) {
        keyspressed.up = false
    }
    if (evt.keyCode == keys.space || evt.keyCode == 87) {
        keyspressed.space = false
    }
    if (evt.keyCode == keys.left || evt.keyCode == 65) {
        keyspressed.left = false
    }
    if (evt.keyCode == keys.right || evt.keyCode == 68) {
        keyspressed.right = false
    }



}

function keypress(evt) {
//    if ([32, 37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
//        evt.preventDefault();
//    }

    return;

    if (evt.keyCode == keys.left || evt.keyCode == 65) {
        pogo.frame.body.angularVelocity = twistval
    }

    if (evt.keyCode == keys.right|| evt.keyCode == 68) {
        pogo.frame.body.angularVelocity = -twistval
    }
}
