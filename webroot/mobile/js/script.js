var oldx,oldy,newx,newy, startx, starty, finalx, finaly, startTime, endTime, sizeFactor, click = false;
$(window).ready( function () {
	$('#container').css('width',$(document).width())
	$('#container').css('height',$(document).height())
	sizeFactor = 942/$(document).height()
	$(window).resize(function (){
		$('#container').css('width',$(document).width())
		$('#container').css('height',$(document).height())
		sizeFactor = 942/$(document).height();
	})
	
	
})
now.cntrlr = 1;
now.ready(function(){
	
	
    var vert = document.getElementById('vert-scroll');
  
    vert.onmousedown =  vert.ontouchstart = function (e) {
    	
    	startTime = new Date().getTime()
    	if (e.changedTouches) { 	// iPhone
			startx = oldx = e.changedTouches[0].clientX
    		starty = oldy = e.changedTouches[0].clientY
		} else { 							// all others
			startx = oldx = e.clientX
    		starty = oldy = e.clientY
		}
    	e.preventDefault();
	};
	
	vert.onmousemove = vert.ontouchmove  = function (e) {
		if (e.changedTouches) { 	// iPhone
			newx = e.changedTouches[0].clientX;
			newy = e.changedTouches[0].clientY;
		} else { 							// all others
			newx = e.clientX;
			newy = e.clientY;
		}

		dx = newx-oldx;
		dy = newy-oldy;
		oldx = newx;
		oldy = newy;
		//alert(e.changedTouches[0].clientY);
		
		now.sendDrag(dx*sizeFactor,dy*sizeFactor);
		e.preventDefault();
	};

    vert.onmouseup =  vert.ontouchend  = function (e) {
    	
    	finalTime = new Date().getTime();
    	if (e.changedTouches) { 	// iPhone
			finalx = e.changedTouches[0].clientX;
			finaly = e.changedTouches[0].clientY;
		} else { 							// all others
			finalx = e.clientX;
			finaly = e.clientY;
		}
    	
    	dtime = finalTime - startTime;
		speedx = (finalx-startx) / dtime;
		speedy = (finaly-starty) / dtime;
		
    	now.sendExtra(speedx*sizeFactor,speedy*sizeFactor)
    	e.preventDefault();
		//alert(user.clientId);
		//now.sendScrollPosition(window.pageXOffset,window.pageYOffset);
	};
	
	var trackpad = document.getElementById('trackpad');
  	  	
    trackpad.onmousedown =  trackpad.ontouchstart = function (e) {
		click = true;
		if (e.changedTouches) { 	// iPhone
			startx = oldx = e.changedTouches[0].clientX
    		starty = oldy = e.changedTouches[0].clientY
		} else { 							// all others
			startx = oldx = e.clientX
    		starty = oldy = e.clientY
		}
    	e.preventDefault();
	};
	
	trackpad.onmousemove = trackpad.ontouchmove  = function (e) {
		if (e.changedTouches) { 	// iPhone
			newx = e.changedTouches[0].clientX;
			newy = e.changedTouches[0].clientY;
		} else { 							// all others
			newx = e.clientX;
			newy = e.clientY;
		}
		if (oldx && oldy) {
			dx = newx-oldx;
			dy = newy-oldy;
			now.sendMouseMove(dx*sizeFactor,dy*sizeFactor);
			//console.log(newx + ":" + oldx + ':' + dx);	
		}
		
		  if (Math.abs(newx - startx) > 10 ||  Math.abs(newy - starty) > 10) {
		    click = false;
		  }
		
		 
		oldx = newx;
		oldy = newy;
		
		e.preventDefault();
	};

    trackpad.onmouseup =  trackpad.ontouchend  = function (e) {
    	if (click) {
	    	trackpad.className = "clicked control-area";
	    	setTimeout(function(){
	    		trackpad.className = "control-area";
	    	}, 200)
	    	now.sendMouseClick(); 
	    }
    	
    	e.preventDefault();
	};
	
	new MBP.fastButton(document.getElementById('draw'), function(e) {
    	if ($('#draw').hasClass('disabled')) {
    		$('#draw').toggleClass('disabled');
    		now.sendEnableCanvas()
    	} else {
    		$('#draw').toggleClass('disabled');
    		now.sendDisableCanvas()
    	}     
    });
    
    new MBP.fastButton(document.getElementById('button-1'), function(e) {
    	if ($('#button-1').attr('setup') == "true") {
    		now.sendButtonCall(1);
    	} else {
    		now.sendButtonSetup(1);
    		//$('#button-1').attr('setup', true);
    	}
    	
    });
    
    new MBP.fastButton(document.getElementById('button-2'), function(e) {
    	if ($('#button-2').attr('setup') == "true") {
    		now.sendButtonCall(2);
    	} else {
    		now.sendButtonSetup(2);
    		//$('#button-1').attr('setup', true);
    	}
    	
    });
	
	now.receiveDrag = function (x,y) {

	}
	
	now.receiveExtra = function () {
		
	}
	
	now.receiveMouseMove = function () {
		
	}
	
	now.receiveMouseClick = function (){
	}
	
	now.receiveEnableCanvas = function () {
		$('#draw').removeClass('disabled');
	}
	
	now.receiveDisableCanvas = function () {
		$('#draw').addClass('disabled');
	}
	
	now.receiveButtonSuccess = function (num) {
		alert('sucess:'+ num);
		if (num==1) {
			$('#button-1').attr('setup', 'true')
		} else if (num == 2) {
			$('#button-2').attr('setup', 'true')
		}
	}
});