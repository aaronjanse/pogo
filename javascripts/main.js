var gameOver = false
var pendingquit = false
var pause = false;

var lives = 3;

var tutorialm = false

var leftplay = false;

var topscore = 0

var score = 0

var world, pogo;

var firstrh = true

var angularVelocity = -0.25

var FRAME = 1, STICK = 2, GROUND = 4, OBSTACLE = 8;

var mobile = false

var oldcontrols = {
		nojoystick: null,
		fixedjoy: null,
		keyboard: null
}

var nojoystick = false

var heightfield;

var oldlabel=""

/* Start of options */
var stiffness = 350, damping = 0.5, restLength = 0.25 // Options for spring

var pogomaterial = new p2.Material()
var icematerial = new p2.Material()

/* End of options */

var sectionA = {
	d: null,
	h: null,
	o: null
}

var sectionB = {
	d: null,
	h: null,
	o: null
}

var options = {
	obstacles: {
		ratity: 10 // obstacle rarity (must be even)
	}
	pogo: {
		spring: {
			stiffness: 350,
			damping: 0.5,
			restLength: 0.25
		}
	}
}

// var main = (function() {
	var mode = {
		MENU: 0,
		PLAY: 1,
		PAUSE: 2,
		TUTORIAL: 3,
		SETTINGS: 4,
		HELP: 5
	}
	
	var obj = {
		rawstate: mode.MENU,
		set state(x) {
			switch(x) {
				case mode.PLAY:
					if(this.state==mode.MENU) {
						$("#mainmenu").hide()
						$("#mainmenu").fadeTo(300, 0)
						$("#gamearea").css('background-color', 'black');
					} else if(this.state==mode.PAUSE) {
						$("#helpbutton").hide()
						$("#settingsbutton").hide()
						$("#homebutton").hide()
					}
					
					$('#pause, #helpbutton, #settingsbutton').removeClass().addClass('circlebutton');
					
					$("#myCanvas").show()
					$("#myCanvas").fadeTo(300, 1)
					
					$("#pause").show()
					$("#pause").fadeTo(300, 1)
					$("#pause").html('<i class="fa fa-pause"></i>')
					
// init();
// requestAnimationFrame(animate);
					break;
				default:
			}
			
			this.rawstate=x;
		},
		get state() {
			return this.rawstate;
		},
		setupMenus: function () {
			var getStatic = (function(varthis) {
				return function(func) {
					return function(){
						func(varthis);
						}
				}
			})(this)
			
			$("#play").click(getStatic(function(thisobj) {
				thisobj.state=mode.PLAY
			}))
			$("#pause").click(getStatic(function(thisobj) {
				if(thisobj.state==mode.PAUSE) {
					thisobj.state=mode.PLAY
				} else {
					thisobj.state=mode.PAUSE;
				}
			}))
		},
		game: {
			world: {
				p2world: null,
				pogo: null,
				sections: {
					a: {
						d: null,
						h: null,
						h1: null,
						h1verts: null,
						o: null,
						od: null
					},
					b: Object.assign({}, this.a) 
				}
			},
			decor: {
				clouds: [],
				rain: (function () {
					var obj = {
							particles : [],
							drops: []
							addRaindrops: function (x, y, pieces) {
								pieces=pieces||options.rain.pieces
							
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
							},
							splash: function (x, y, col, cnt) {
								cnt=cnt||options.rain.splashSize
								while(cnt--) {
									this.drops.push({
											velX : (Math.random() * 4-2	),
											velY : (Math.random() * -4 ),
											x: x,
											y: y,
											radius : 0.65 + Math.floor(Math.random() *1.6),
											alpha : 1,
											col : col
									});
								}
							},
					render: function (ctx) {
						var tau = Math.PI * 2;
						var localparticles = this.particles
						var localdrops = this.drops
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
					},
					update: function () {
						var localparticles = this.particles;
						var localdrops = this.drops;
						
						for (var i = 0, activeparticles; activeparticles = localparticles[i]; i++) {
							activeparticles.x += activeparticles.velX;
							activeparticles.y += activeparticles.velY+5;
							var gh = 0;
							var worldX = activeparticles.x/50-xscroll-w/50/2
							var idx;
							if(worldX>sectionB.h.body.position[0]) { // in
																		// sectionB
								 var real = (worldX-sectionB.h.body.position[0])/2
								 idx = Math.floor(real)
								var amnt = (real%2)/2
								var diff = (sectionB.d[idx+1]-sectionB.d[idx])||0
								gh = -(sectionB.d[idx]+diff*amnt)*50
							} else { // in sectionA
								
								var real = (worldX-sectionA.h.body.position[0])/2
								idx = Math.floor(real)
								var amnt = ((real*2)%2)/2
								var diff = (sectionA.d[idx+1]-sectionA.d[idx])||0
								gh = -(sectionA.d[idx]+diff*amnt)*50
							}
							gh+=h/2
							gh+=yscroll*50
							gh+=50
							if (activeparticles.y > gh) {// height-15) {
								localparticles.splice(i--, 1);
								this.splash(activeparticles.x, activeparticles.y, activeparticles.col);
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
							if(this.idx!=0) {
								i=0
								break;
							}
							this.addRaindrops(Math.floor(Math.random()*this.w), -500); // this.x-cloudSize*2+(Math.random()*cloudSize*2)...this.y-15
						}
					},
					offset: function(x, y) {
						for(var i = 0; i < this.particles.length; i++) {
							this.particles[i].x-=x;
							this.particles[i].y-=y;
						}
						
						for(var i = 0; i < this.drops.length; i++) {
							this.drops[i].x-=x;
							this.rain.drops[i].y-=y;
						}
					}
				}
					obj.init();
					return obj;
				})()
			},
			controls: {
				init: function() {
					
				}
			}
			init: function() {
				this.controls.init()
			},
			animate: function() {
				
			},
			pause: function() {
				
			},
			play: function() {
				
			}
		},
		
		init: function () {
			this.setupMenus();
		}
	}
	
	obj.init()
//	
// return obj;
// })()

function changeOrientation() {
	var canv = document.getElementById("myCanvas")
	if(canv.width!=window.innerWidth) {
		var tmp = canv.width
		document.getElementById("myCanvas").width=canv.height
		document.getElementById("myCanvas").height=tmp
	}
	
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;
	
	setupjoy()
}

function fullscreen() {
// console.log("FULLSCREEN")
// var check = false; //from detectmobilebrowsers.com
// (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge
// |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm(
// os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows
// ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a
// wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r
// |s
// )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1
// u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp(
// i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac(
// |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt(
// |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg(
// g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-|
// |o|v)|zz)|mt(50|p1|v
// )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v
// )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-|
// )|webc|whit|wi(g
// |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check =
// true})(navigator.userAgent||navigator.vendor||window.opera);
	
	document.getElementById("myCanvas").style.width = '100%';
	document.getElementById("myCanvas").style.height = '100%';
	document.getElementById("myCanvas").width = window.innerWidth
	document.getElementById("myCanvas").height = window.innerHeight
}

function resetHealth() {
	document.getElementById("health").style.animation='fadeinout 4s linear forwards';
	
	var elm = document.getElementById("health")
	elm.style.display='block'
	var newone = elm.cloneNode(true);
	elm.parentNode.replaceChild(newone, elm);
	
	document.getElementById("health").innerHTML=
	  '<i class="fa fa-heart" aria-hidden="true"></i> '
	+ '<i id="h2" class="fa fa-heart" aria-hidden="true"></i> '
	+ '<i id="h3" class="fa fa-heart" aria-hidden="true"></i>';
}

function loseHeart() {
	document.getElementById("health").style.animation='fadeinout 4s linear forwards';
	var elm = document.getElementById("health")
	elm.style.display='block'
	var newone = elm.cloneNode(true);
	elm.parentNode.replaceChild(newone, elm);
	if(lives==2) {
		document.getElementById("health").innerHTML=
			  '<i class="fa fa-heart" aria-hidden="true"></i> '
			+ '<i id="h2" class="fa fa-heart" aria-hidden="true"></i> '
			+ '<i id="h3" class="fa fa-heart-o" aria-hidden="true"></i>';
	}
	
	if(lives==1) {
		document.getElementById("health").innerHTML=
			  '<i class="fa fa-heart" aria-hidden="true"></i> '
			+ '<i id="h2" class="fa fa-heart-o" aria-hidden="true"></i> '
			+ '<i id="h3" class="fa fa-heart-o" aria-hidden="true"></i>';
	}
	
	if(lives<=0) {
		document.getElementById("health").innerHTML=
			  '<i class="fa fa-heart-o" aria-hidden="true"></i> '
			+ '<i id="h2" class="fa fa-heart-o" aria-hidden="true"></i> '
			+ '<i id="h3" class="fa fa-heart-o" aria-hidden="true"></i>';
	}
}

function processopts() {
	var k, fj, nj;
	k=fj=nj=false;
	switch($(".dropdowntitle").val()) {
		case 'Joystick':
			fj=true
			nj=false;
			break;
		case 'Unfixed Joystick':
			fj=false
			nj=false;
			break;
		case 'Gyro':
			nj=true;
			break;
		case 'Keyboard':
			k=true;
		case '':
		default:
	}
	
	updatehelp(nj, k, fj);
}

function saveopts() {
	saveopts1(true)
}

function saveopts1(tutsave) {
	keyboard=false;
	switch($(".dropdowntitle").val()) {
		case 'Joystick':
			fixedjoy=true
			nojoystick=false;
			break;
		case 'Unfixed Joystick':
			fixedjoy=false
			nojoystick=false;
			break;
		case 'Gyro':
			nojoystick=true;
			break;
		case 'Keyboard':
			keyboard=true;
		case '':
		default:
	}
	
// if(tutsave) {
// oldcontrols = {
// nojoystick: nojoystick,
// fixedjoy: fixedjoy,
// keyboard: keyboard
// }
// }
	
	updatehelp(nojoystick, keyboard, fixedjoy);
	
	setupjoy();
}

function onload() {
	
	window.mobileAndTabletcheck = function() {
		  var check = false;
		  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		  return check;
	}
	
	mobile = window.mobileAndTabletcheck();
	
	if(!mobile) {
		$(".gyro").hide();
	} else {
		$(".keyboard").hide();
		$(".dropdowntitle").html("Gyro"+' <span class="caret">');
	     $(".dropdowntitle").val("Gyro");
	}
	
	$(".controls").clone().appendTo(".controlsdiv")
	
	$(".helptxtdiv").clone().appendTo(".tutcontrolsdiv")
	
	$('.dropdown-menu li a').on('click', function() {
	    // $('.dropdowntitle').html($(this).find('a').html()+' <span
		// class="caret">');
		$(".dropdowntitle").html($(this).text()+' <span class="caret">');
	      $(".dropdowntitle").val($(this).text());
	      processopts()
	});
	
// $('.savesel').on('click', function() {
// console.log("Hi!");
// alert("Hi")
// });
	fullscreen()
	window.addEventListener("orientationchange", function() {
		  // Announce the new orientation number
// alert(window.orientation);
		changeOrientation()
		}, false);
	
	window.onresize = function onresize() {
		w = canvas.width = window.innerWidth;
		w = canvas.height = window.innerHeight;
		
		ctx = canvas.getContext("2d");
		ctx.lineWidth = 0.05;
	}
}

function init() {
	gameOver = false
	pendingquit = false
	// detects mobile
// var check = false; //from detectmobilebrowsers.com
// (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge
// |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm(
// os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows
// ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a
// wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r
// |s
// )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1
// u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp(
// i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac(
// |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt(
// |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg(
// g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-|
// |o|v)|zz)|mt(50|p1|v
// )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v
// )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-|
// )|webc|whit|wi(g
// |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check =
// true})(navigator.userAgent||navigator.vendor||window.opera);
	
	
	
	console.log("Mobile or tablet: "+mobile)
	
// if(mobile&&!fixedjoy) {
// // togglefixedjoy() //fix the joystick location on mobile in case not by
// default
//	
// }
	nojoystick=mobile;
	
// if(mobile) {
// if(!nojoystick) {
// joysticktoggle()
// }
// } else { // Disable button
// joysticktoggle()
// joysticktoggle()
// }
	
	updatehelp(nojoystick, keyboard, fixedjoy);
	
	if(mobile) {
		elems = document.getElementsByClassName("dtop")
		for(var i = 0; i < elems.length; i++) {
			elems[i].style.display="none"
		}
	}
	
	// Init canvas
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;
	
	noise.seed(Math.random()*10);
	// Init p2.js
	
	if(!tutorialm) {
		initgame()
	} else {
		inittut()
	}
	initControls()
}

var secnum = 0;
var secwidth = null;
var padding = 2;

function copysec(s) {
	var obstacles = []
// var idx = 0
	for(var idx = 0; idx < s.o.length; idx++) {
	        var circleShape = new p2.Circle({ radius: 0.5, sensor: true });
	        var circleBody = new p2.Body({ mass:1, position:s.o[idx].position, fixedX: s.o[idx].fixedX, fixedY: s.o[idx].fixedY, velocity: s.o[idx].velocity});
	        circleBody.addShape(circleShape);
	        circleShape.collisionGroup = OBSTACLE;
	        circleShape.collisionMask = FRAME|STICK;
	        obstacles.push(circleBody);
// idx+=1
	}
	
	var heightfield = new Object();
	heightfield.shape = new p2.Heightfield({
		heights : s.d,
		elementWidth : 2
	});
	heightfield.body = new p2.Body({
		position : s.h.body.position
	});
	heightfield.shape.collisionGroup = GROUND;
	heightfield.shape.collisionMask = FRAME|STICK;
	
	heightfield.body.addShape(heightfield.shape);
	
	var h1 = null
	if(s.h1!=null) {
		h1 = new Object();
		h1.body = new p2.Body({
			position : s.h1.body.position
		});
		h1.body.fromPolygon(JSON.parse(JSON.stringify(s.h1verts)))
		for(var i = 0; i < h1.body.shapes.length; i++) {
			h1.body.shapes[i].collisionGroup = GROUND;
			h1.body.shapes[i].collisionMask = FRAME|STICK;
			h1.body.shapes[i].material=icematerial
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
	}
}

function changenum(s1, num, oldnum) {
	var s = copysec(s1)
	s.h.body.position[0] += (num-oldnum)*secwidth
	for(var i = 0; i < s.o.length; i++) {
		s.o[i].position[0] += (num-oldnum)*secwidth
		s.o[i].velocity=[0, 0]
	}
	
	if(s.h1!=null) {
		s.h1.body.position[0] += (num-oldnum)*secwidth
	}
	return s;
}

function caveMouthSigmoid(x) {
	return -2*(x/(1+Math.abs(x)))-1;
}

var caveDepth = 4;
var caveHeight = 5;

function generateSection() {
	var data = [];
	
	var ceilverts = []
	var startedceil=false
	var endceil = false
	var ceilx = null
	var ceily = null
	var ice = false
	for (var i = 0; i <= secwidth/2; i++) {
		var v = (i+secnum*secwidth/2) / 10
		
		var value = noise.simplex2(v, 0)*1.75;
		var lvl=distToTime(secnum*secwidth+i*2)
		if(lvl>2) {
			if(lvl%2<1&&(Math.floor(lvl)<7||Math.floor(lvl)==9)) { // Cave
				value=value/1.75; // Make terrain smoother
				var ychange=null;
				if(lvl%1<=0.5) {
					var x = (lvl%1)*4-1
					ychange=caveMouthSigmoid(x)*caveDepth
				}
				
				if(lvl%1>0.5) {
					var x = ((lvl-0.5)%1)*4-1
					ychange=caveMouthSigmoid(-x)*caveDepth
				}
				
				value+=ychange;
				
				if(ychange<-caveDepth/2||startedceil) {
					var y = value+caveHeight
					if(!startedceil) {
						ceilx=i*2
						ceily=y
						startedceil=true
						
						ceilverts.push([5, 2+3])
						ceilverts.push([0, 5+3])
					}
					ceilverts.push([i*2-ceilx, y-ceily])
					
					if((i%rarity==rarity-2)&&i!=secwidth/2) {
						if(Math.random()>0.5) {
							value += Math.random()*2
						} else {
							ceilverts.push([i*2-ceilx, y-ceily-Math.random()*1.5-1])
						}
					}
				}
			} else {
				if(lvl>=7&&lvl<9) {
					if(!startedceil) {
						value = Math.max(value, 1)
						ceilx=i*2
						ceily=-9
						startedceil=true
						ice=true
						ceilverts.push([0, 0])
					} else {
						value=-2
					}
					ceilverts.push([i*2-ceilx, 1-ceily])
				}
			}
		}
		data.push(value)
	}
	
	var heightfield = new Object();
	heightfield.shape = new p2.Heightfield({
		heights : data,
		elementWidth : 2
	});
	heightfield.body = new p2.Body({
		position : [ -1, -1 ]
	});
	heightfield.shape.collisionGroup = GROUND;
	heightfield.shape.collisionMask = FRAME|STICK;
	
	heightfield.body.addShape(heightfield.shape);
	
	var cm = null
	
	if(startedceil) {
		if(!ice) {
			ceilverts.push([ceilverts[ceilverts.length-1][0], ceilverts[ceilverts.length-1][1]+5+3])
		} else {
			ceilverts.push([ceilverts[ceilverts.length-1][0], 0])
		}
// ceilverts.reverse()
		var h1 = new Object();
		h1.body = new p2.Body({
			position : [ceilx-1, ceily-1]
		});
		h1.body.fromPolygon(JSON.parse(JSON.stringify(ceilverts)))
// console.log(h1.body.fromPolygon(JSON.parse(JSON.stringify(ceilverts))))
// console.log(h1.body)
		for(var i = 0; i < h1.body.shapes.length; i++) {
			h1.body.shapes[i].collisionGroup = GROUND;
			h1.body.shapes[i].collisionMask = FRAME|STICK;
// if(ice) {
				h1.body.shapes[i].material=icematerial
// }
		}
	}
	
	var od = []
	var y = null;
	var obstacles = [];
	for(var i = 1; i < data.length; i++) {
		if(i%rarity==0) {
			var lvl = Math.floor(distToTime(secnum*secwidth+i*2))
			if(Math.random()>0.5&&lvl!=0&&(lvl>2&&lvl%2<1)) {
				y = data[i]+Math.random()*2
			} else {
				y = data[i]+5-Math.random()*2
			}
			
			if(lvl==0) {
				y+=4
			}
			if(lvl>2&&lvl<3) {
				y-=20
			}
			
			od.push(y)
	        var circleShape = new p2.Circle({ radius: 0.5, sensor: true });
	        var circleBody = new p2.Body({ mass:1, position:[i*2,y], fixedX: true, fixedY: true});
	        circleBody.addShape(circleShape);
	        circleShape.collisionGroup = OBSTACLE;
	        circleShape.collisionMask = FRAME|STICK;
	        obstacles.push(circleBody);
		}
	}
	
	secnum+=1
	
	if(h1!=null&&ceilverts.length<1) {
		ceilverts = [[-1, 1],
                   [-1, 0],
                   [1, 0],
                   [1, 1],
                   [0.5, 0.5]];
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
	world.addBody(s.h.body)
	for(var i = 0; i < s.o.length; i++) {
		world.addBody(s.o[i])
	}
	
	if(s.h1!=null) {
		world.addBody(s.h1.body)
	}
	
// if(s.cm!=null) {
// world.addContactMaterial(s.cm);
// }
}

function removeSection(s) {
	world.removeBody(s.h.body)
	for(var i = 0; i < s.o.length; i++) {
		world.removeBody(s.o[i])
	}
	
	if(s.h1!=null) {
			world.removeBody(s.h1.body)
	}
	
// if(cm!=null) {
// world.removeContactMaterial(cm);
// }
}

function getsecwidth() {
	var canvaswidth = Math.ceil(w/50+padding) // Get the ceil of the canvas
												// width (along with extra
												// padding) in game units
	var x = Math.ceil(canvaswidth/rarity)*rarity // round so that distance
													// between obstacles is
													// consistent between
													// sections
	return x;
}

// from http://stackoverflow.com/a/3261380
function isEmpty(str) {
    return (!str || 0 === str.length);
}

var lvlCnt = 10;

var lvl1length = 100;

function distToTime(dist) { // in half days
	return lvlCnt*(1-Math.pow(1-1/lvlCnt, dist/lvl1length));
}

function initgame() {
	orientationData = new FULLTILT.DeviceOrientation( { 'type': 'game' } );
	initRender();
	cookie = getCookie("topscore")
	if(isEmpty(cookie)) {
		document.cookie = "topscore=0; expires=Tue, 19 Jan 2038 03:14:07 UTC;";
	} else {
		topscore=parseInt(cookie)
	}
	
	score=0
	secnum = 0
	lives = 3
	resetHealth()
	gameOver = false
	pendingquit = false
	world = new p2.World({
		gravity : [ 0, -7 ]
	});
	
	world.defaultContactMaterial.friction = 100;
	world.defaultContactMaterial.restitution = 0.1;
	
	world.addContactMaterial(new p2.ContactMaterial(icematerial, pogomaterial, {
		restitution: 0,
        friction: 25
    }));
	
	var pogox = w/50/2;
	
	pogo = {
		stick : new Object(),
		frame : new Object(),
		spring : null
	};

	pogo.stick.shape = new p2.Box({
		width : 0.25,
		height : 1.6,
		material: pogomaterial
	});
	
	pogo.stick.body = new p2.Body({
		mass : 0.25,
// damping: 0.2,
		position : [ pogox, 2.75],
		angularVelocity : angularVelocity,
		velocity : [ 5, 0 ]
	});
	
	pogo.frame.shape = new p2.Box({
		width : 0.5,
		height : 1.5,
		material: pogomaterial
	});
	
	pogo.frame.body = new p2.Body({
		mass : 3,
		position : [ pogox, 3 ],
		angularVelocity : angularVelocity,
		velocity : [ 5, 0 ]
	});
	
	pogo.frame.body.addShape(pogo.frame.shape);
	pogo.stick.body.addShape(pogo.stick.shape);
	
	world.addBody(pogo.frame.body);
	world.addBody(pogo.stick.body);

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
	 c1.setLimits(-1, -0.4);
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
	
	secwidth = getsecwidth()
	
	sectionA = generateSection();
	sectionB = changenum(generateSection(), 1, 0);
	
	addSection(sectionA)
	addSection(sectionB)
	
	// Setup Collisions
	
	pogo.frame.shape.collisionGroup = FRAME;
	pogo.stick.shape.collisionGroup = STICK;
	
	pogo.frame.shape.collisionMask = GROUND|OBSTACLE;
	pogo.stick.shape.collisionMask = GROUND|OBSTACLE;
	
	world.on("postStep", updateObstacles);
	
	world.on("beginContact",function(event){
		if(event.bodyA == pogo.frame.body || event.bodyB == pogo.frame.body) {
			var h = event.bodyA == sectionA.h.body || event.bodyB == sectionA.h.body
			h = h || event.bodyA == sectionB.h.body || event.bodyB == sectionB.h.body
			if(!h) {
			lives-=1
			loseHeart()
			} else {
				lives=0
				loseHeart()
			}
			if(lives<=0||h) {
				gameOver = true;
				leftplay = false;
			}
		}
	});
}

function updateObstacles() {
	var t = distToTime((secnum-1)*secwidth)
// console.log(t)
	if(t>3) {
		if(t<5) {
			if(sectionA.h1===null||true) {
				for(var i = 0; i < sectionA.o.length; i++) {
					sectionA.o[i].fixedY = false;
					sectionA.o[i].velocity[1] = 2.5 * Math.sin(world.time*3);
				}
			}
		
			if(sectionB.h1===null||true) {
				for(var i = 0; i < sectionB.o.length; i++) {
					sectionB.o[i].fixedY = false;
					sectionB.o[i].velocity[1] = 2.5 * Math.sin(world.time*3);
				}
			}
		} else {
			var calc = function (b, a, invert) {
				var v = [a[0]-b[0], a[1]-b[1]]
				var mag = Math.sqrt(v[0]*v[0]+v[1]*v[1])
				if(mag<=0) {
					console.log("zero mag! target reached!")
					return [0, 0]
				}
				var speed = Math.sin((Math.min(mag, 9)/10)*Math.PI)
				speed*=3 // Top Speed
				speed = Math.max(speed, 1) // Min speed
				if(speed/mag<=0) {
				console.log("HELP ME!!!!!")
				}
				speed*=invert?-1:1
				v = [v[0]*speed/mag, v[1]*speed/mag] // Normalize then scale
// console.log(v)
				return v;
			}
			if(sectionA.h1===null||true) {
// console.log("A")
				for(var i = 0; i < sectionA.o.length; i++) {
// sectionA.o[i].fixedX = false;
// sectionA.o[i].fixedY = false;
					var pos = sectionA.o[i].position
					var ppos = pogo.stick.body.position
					
					sectionA.o[i].velocity = calc(pos, ppos, sectionA.inverts[i]);
				}
			}
		
			if(sectionB.h1===null||true) {
// console.log("B")
				for(var i = 0; i < sectionB.o.length; i++) {
// sectionB.o[i].fixedX = false;
// sectionB.o[i].fixedY = false;
					var ppos = sectionB.o[i].position
					var pos = pogo.stick.body.position
					
					sectionB.o[i].velocity = calc(pos, ppos, sectionB.inverts[i]);
				}
			}
		}
	}
}