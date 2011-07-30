// ** OUR STUFF ** //

var scroller,oldx,oldy,newx,newy,
	isDragging = false,
	cntrlrClickCalled = false,
	cntrlrCanvasContext,
	cntrlrCanvasEnabled = false,
	set1 = false,
	set2 = false,
	elem1 = null,
	elem2 = null,
	elemInput = null;
	
function cntrlrSimulateEvent(element, type) {
    // Check for createEventObject
    if(document.createEventObject){
        // Trigger for Internet Explorer
        trigger = document.createEventObject();
        element.fireEvent('on' + type, trigger);
    }
    else {
        // Trigger for the good browsers
		if(type == 'click') {
			trigger = document.createEvent('MouseEvent');
		} else {
	        trigger = document.createEvent('HTMLEvents');
		}
        trigger.initEvent(type, true, true);
        element.dispatchEvent(trigger);
    }
}

function cntrlrRandomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
	var string_length = 20;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

/**
 * @author max kanter
 */

function Scroller (element) {
	self = this;
	self.element = (element) ? element : window;
	self.$element =  $(self.element);
	
	self.currentx = self.$element.scrollLeft();
	self.currenty = self.$element.scrollTop();
	self.speedx = 0;
	self.speedy = 0;
	
	self.element.onscroll = function (e) {
		
		if (Math.abs(self.currentx - self.$element.scrollLeft())>10 || Math.abs(self.currenty - self.$element.scrollTop())>10) {
			self.currentx = self.$element.scrollLeft();
			self.currenty = self.$element.scrollTop();	
			self.speedx = 0;
			self.speedy = 0;	
		}
		
	}
	
	isScrolling = false;
	
	//console.log('currentx: ' + self.currentx + 'currenty: ' + self.currenty);
}

Scroller.prototype = {
	updatePos : function (dx,dy){
		
		if (self.currenty<0) {
			self.speedy = 0;
			self.currenty=0;
		} else if (self.checkBottom()) {
			self.speedy = 0;
			self.currenty = $(document).height() - $(window).height();
		}else if (dy){
			self.currenty-=dy
		}
		
		if (self.currentx<0) {
			self.speedx = 0;
			self.currentx=0;
		} else if (self.checkRight()) {
			self.speedx = 0;
			self.currentx = $(document).width() - $(window).width();
		}else if (dx){
			self.currenty-=dx
		}
		
		console.log('dx:' + self.currentx + 'dy:' + self.currenty);
		self.$element[0].scroll(self.currentx,self.currenty) //using vanilla js here instead of jQuery's scrolling functions
	}, 
	handleInput: function (dx,dy) {
		self.isScrolling = true;
		
		self.updatePos(dx,dy)
	},
	handleExtra: function (vx,vy) {
		//&& self.$element.scrollLeft() !== 0 && self.$element.scrollLeft() !== self.$element.width()
		//&& self.$element.scrollTop() !== 0 && self.$element.scrollTop() !== self.$element.height()
		//self.vx = (self.vx>self.friction) ? self.vx - self.friction : 0;
		//self.vy = (self.vy>self.friction ) ? self.vy- self.friction : 0;
		if (vx) {
			self.speedx = vx*20;	
		} 
		
		if (vy) {
			self.speedy = vy*20;	
		}
		
		self.speedx*=.9;
		self.speedy*=.9;
		
		self.updatePos(self.speedx,self.speedy);
		
		if (Math.abs(self.speedy)<1) {
			self.speedx = 0;
		} else if (Math.abs(self.speedy)<1) {
			self.speedy = 0;
		}
		
		if (Math.abs(self.speedx)>.2 || Math.abs(self.speedy)>.2) {
			setTimeout(self.handleExtra, 50)
		}
		
	}, 
	checkBottom: function () {
		console.log($(document).height() - $(window).height() - $(window).scrollTop()<=0);
		return self.currenty > $(document).height() - $(window).height();
	},
	checkRight: function () {
		return self.currenty > $(document).width() - $(window).width();
	}
}

$(function () {
	//$("#cntrlr-cursor").remove();
	//$("#cntrlr-canvas").remove();
	now.cntrlr = 1;
	now.ready(function(){
		now.receiveDrag = function (dx,dy) {
			scroller.handleInput(dx,dy);
		}

		now.receiveExtra= function (speedx,speedy) {
			scroller.handleExtra(speedx,speedy);
		}

		now.receiveMouseMove = function (dx, dy) {
			var cntrlrLeft, cntrlrTop;
			console.log(dx + " " + dy);
			if(cntrlrCanvasEnabled) {
				cntrlrCanvasContext.beginPath();
				cntrlrCanvasContext.moveTo($("#cntrlr-cursor").position().left, $("#cntrlr-cursor").position().top);
			}
			if(dx && dy) {
				$("#cntrlr-cursor").css({ top: (dy < 0 ? "-=" : "+=") + Math.abs(dy) + "px", left: (dx < 0 ? "-=" : "+=") + Math.abs(dx) + "px" });
				cntrlrLeft = parseInt($("#cntrlr-cursor").css('left').replace('px', ''), 10);
				cntrlrTop = parseInt($("#cntrlr-cursor").css('top').replace('px', ''), 10);
				if(cntrlrLeft < 10) {
					$("#cntrlr-cursor").css({ left: 10 });
				}
				if(cntrlrLeft >= ($(window).width() - 10)) {
					console.log("2");
					$("#cntrlr-cursor").css({ left: $(window).width() - 10 });
				}
				if(cntrlrTop < 10) {
					$("#cntrlr-cursor").css({ top: 10 });
				}
				if(cntrlrTop >= ($(window).height() - 10)) {
					$("#cntrlr-cursor").css({ top: $(window).height() - 10 });
				}
			}
			if(cntrlrCanvasEnabled) {
				cntrlrCanvasContext.lineTo($("#cntrlr-cursor").position().left, $("#cntrlr-cursor").position().top);
				cntrlrCanvasContext.stroke();
				cntrlrCanvasContext.closePath();
			}
		}

		now.receiveMouseClick = function () {
			if(cntrlrCanvasEnabled) {
				cntrlrCanvasContext.strokeStyle = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
			} else {
				cntrlrClickCalled = true;
				$("#cntrlr-cursor").hide();
				elem = document.elementFromPoint(parseInt($("#cntrlr-cursor").css('left').replace('px', ''), 10), parseInt($("#cntrlr-cursor").css('top').replace('px', ''), 10));
				if(elem != null) {
					if (set1 || set2) {
						if (set1) {
							set1 = false;
							elem1 = elem;
							console.log(elem1)
							console.log(elem2)
							now.sendButtonSuccess(1);
						} else if (set2) {
							set2 = false;
							elem2 = elem;
							console.log(elem1)
							console.log(elem2)
							now.sendButtonSuccess(2);
						}
					} else if((elem.tagName == "INPUT" && elem.type.toLowerCase() != "submit" && elem.type.toLowerCase() != "checkbox" && elem.type.toLowerCase() != "radio" && elem.type.toLowerCase() != 'image') || elem.tagName == "TEXTAREA" || elem.tagName == "SELECT") {
							//$(elem).click();
							$(elem).focus();
							
							console.log(elemInput);
							if (!elemInput) {
								elemInput = elem;
								console.log('sendmaketextinput')
								now.sendMakeTextInput($(elemInput).val());	
							}
							
					} else {
						if(elem.tagName == "INPUT" && (elem.type.toLowerCase() == "checkbox" || elem.type.toLowerCase() == "radio")) {
							$(elem).click();
						} else {
							cntrlrSimulateEvent(elem, 'click');
						}
					}
				}
				$("#cntrlr-cursor").show();
				if ($("#cntrlr-cursor").hasClass('click')) {
					$("#cntrlr-cursor").toggleClass('click');
				}
				$("#cntrlr-cursor").toggleClass('click');
				cntrlrClickCalled = false;
			}
		}
		
		now.receiveEnableCanvas = function () {
			$("#cntrlr-canvas").show();
			cntrlrCanvasEnabled = true;
		}
		
		now.receiveDisableCanvas = function () {
			$("#cntrlr-canvas").hide();
			cntrlrCanvasEnabled = false;
		}
		
		now.receiveButtonCall = function (num) {
			console.log('button-call')
			if (num == 1) {
				cntrlrSimulateEvent(elem1,'click')
			} else if (num == 2) {
				cntrlrSimulateEvent(elem2,'click')
			}
		}
		
		now.receiveButtonSetup = function (num) {
			console.log('button-setup')
			if (num ==1) {
				set1 = true;
				set2 = false;
			} else if (num == 2) {
				set1 = false;
				set2 = true;
			}
		}
		
		now.receiveButtonSuccess = function (num) {
			console.log('button' + num + "sucess") 
		}
		
		now.receiveButtonFailure = function (num) {
			if (num ==1) {
				set1 = false;
			} else if (num == 2) {
				set2 = false;
			}
			console.log('button' + num + "fail") 
		}
		
		now.receiveTextInput = function (text) {
			console.log(text);
			$(elemInput).val(text);
			$(elemInput).trigger('keyup');
			elemInput = null;
		}
		
		now.receiveUrl = function (url) {
			window.location = url;
		}
	});
	scroller = new Scroller();
	$("head").append("<link href='http://localhost:8082/static/desktop.css' rel='stylesheet' />");
	$("body").addClass('cntrlr-enabled');
	$("body").append('<div id="cntrlr-cursor"></div>');
	$("body").append('<canvas id="cntrlr-canvas" style="position: absolute; display: none; left: 0; top: 0;"></canvas>');
	$("body").bind("mousemove", function (event) {
		$("#cntrlr-cursor").css({ top: (event.clientY) + "px", left: (event.clientX) + "px" });
	});
	$("body").bind("click", function (event) {
		if(!cntrlrClickCalled) {
			$("#cntrlr-cursor").hide();
			cntrlrClickCalled = true;
			elem = document.elementFromPoint(event.clientX, event.clientY);
			console.log(elem);
			if((elem.tagName == "INPUT" && elem.type.toLowerCase() != "submit" && elem.type.toLowerCase() != "checkbox" && elem.type.toLowerCase() != "radio") || elem.tagName == "TEXTAREA" || elem.tagName == "SELECT") {
				$(elem).click();
				$(elem).focus();
			} else {
				console.log(event);
				if(elem.tagName == "INPUT" && (elem.type.toLowerCase() == "checkbox" || elem.type.toLowerCase() == "radio")) {
					$(elem).click();
				} else {
					cntrlrSimulateEvent(elem, 'click');
				}
			}
			cntrlrClickCalled = false;
			$("#cntrlr-cursor").show();
		}
		return true;
	});
	$("#cntrlr-canvas").attr('width', $(document).width());
	$("#cntrlr-canvas").attr('height', $(document).height());
	cntrlrCanvasContext = $("#cntrlr-canvas")[0].getContext('2d');
	cntrlrCanvasContext.lineWidth = 15;
	cntrlrCanvasContext.lineCap = "round";
});

// $(function () {
// 	$("head").append("<link href='http://localhost:8082/static/desktop.css' rel='stylesheet' />");
// 	$("body").addClass('cntrlr-enabled');
// 	$("body").append('<div id="cntrlr-cursor"></div>');
// 	$("body").bind("mousemove", function (event) {
// 		$("#cntrlr-cursor").css({ top: (event.clientY) + "px", left: (event.clientX) + "px" });
// 	});
// 	// $("body").bind("mousedown", function (event) {
// 	// 	// $("#cntrlr-cursor").css({ left: "+=20px" });
// 	// 	// $("#cntrlr-cursor").hide();
// 	// });
// 	// $("body").bind("mouseup", function (event) {
// 	// 	console.log(event.target);
// 	// 	$("#cntrlr-cursor").show();
// 	// });
// 	$("body").bind("click", function (event) {
// 		if(!cntrlrClickCalled) {
// 			$("#cntrlr-cursor").hide();
// 			cntrlrClickCalled = true;
// 			// $("body").removeClass('cntrlr-enabled');
// 			elem = document.elementFromPoint(event.clientX, event.clientY);
// 			console.log(elem);
// 			if((elem.tagName == "INPUT" && elem.type.toLowerCase() != "submit" && elem.type.toLowerCase() != "checkbox" && elem.type.toLowerCase() != "radio") || elem.tagName == "TEXTAREA" || elem.tagName == "SELECT") {
// 				$(elem).click();
// 				$(elem).focus();
// 			} else {
// 				console.log(event);
// 				if(elem.tagName == "INPUT" && (elem.type.toLowerCase() == "checkbox" || elem.type.toLowerCase() == "radio")) {
// 					$(elem).click();
// 				} else {
// 					cntrlrSimulateEvent(elem, 'click');
// 				}
// 			}
// 			// document.elementFromPoint(event.clientX, event.clientY).fireEvent('onclick', event);
// 			// event.initEvent('click', true, true);
// 			// document.elementFromPoint(event.clientX, event.clientY).dispatchEvent(event);
// 			// cntrlrSimulateEvent(document.elementFromPoint(event.clientX, event.clientY), 'focus');
// 			// $(document.elementFromPoint(event.clientX, event.clientY)).focus();
// 			// $("body").addClass('cntrlr-enabled');
// 			cntrlrClickCalled = false;
// 			$("#cntrlr-cursor").show();
// 		}
// 		return true;
// 	});
// 	
// 	// $("body").bind("cntrlr.click", function (event) {
// 	// 	if (document.createEvent) {
// 	//        // dispatch for firefox + others
// 	//        var evt = document.createEvent("HTMLEvents");
// 	//        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
// 	//        return !element.dispatchEvent(evt);
// 	//    } else {
// 	//        // dispatch for IE
// 	//        var evt = document.createEventObject();
// 	//        return element.fireEvent('on'+event,evt)
// 	//    }
// 	// });
// 	
// 	$("#js").click(function () { alert("hi"); return false; });
// });