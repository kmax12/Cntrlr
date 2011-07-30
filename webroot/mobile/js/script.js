var oldx,oldy,newx,newy, startx, starty, finalx, finaly, startTime, endTime, sizeFactor
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
now.ready(function(){
	now.cntrlr = 1;
	
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
    	
    	console.log('start')
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
		if (e.changedTouches) { 	// iPhone
			oldx = e.changedTouches[0].clientX
    		oldy = e.changedTouches[0].clientY
		} else { 							// all others
			oldx = e.clientX
    		oldy = e.clientY
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
			console.log(newx + ":" + oldx + ':' + dx);	
		}
		 
		oldx = newx;
		oldy = newy;
		
		
		now.sendMouseMove(dx*sizeFactor,dy*sizeFactor);
		e.preventDefault();
	};

    trackpad.onmouseup =  trackpad.ontouchend  = function (e) {
    	e.preventDefault();
	};
	
	now.receiveDrag = function (x,y) {

	}
	
	now.receiveExtra = function () {
		
	}
	
	now.receiveMouseMove = function () {
		
	}
	
	now.receiveMouseClick = function (){
		
	}
});