var oldx,oldy,newx,newy, startx, starty, finalx, finaly, startTime, endTime
$(window).ready( function () {
	$('#container').css('width',$(document).width())
	$('#container').css('height',$(document).height())
	$(window).resize(function (){
		$('#container').css('width',$(document).width())
		$('#container').css('height',$(document).height())
	})
	
})
now.ready(function(){
	
    var vert = document.getElementById('vert-scroll');
  
    vert.ontouchstart =  vert.onmousedown = function (e) {
    	startTime = new Date().getTime()
    	startx = oldx = e.clientX
    	starty = oldy = e.clientY
    	console.log('start')
    	e.preventDefault();
	};
	
	vert.onmousemove = vert.ontouchmove  = function (e) {
		newx = e.clientX;
		newy = e.clientY;
		dx = newx-oldx;
		dy = newy-oldy;
		oldx = newx;
		oldy = newy;
		
		now.sendDrag(dx,dy);
		e.preventDefault();
	};

    vert.ontouchend =  vert.onmouseup = function (e) {
    	console.log('end')
    	endTime = new Date().getTime();
    	finalx = e.clientX;
    	finaly = e.clientY;
    	
    	dtime = finalTime - startTime;
		speedx = (finalx-startx) / dtime;
		speedy = (finaly-starty) / dtime;
    	
    	now.sendExtra(speedx,speedy)
    	e.preventDefault();
		//alert(user.clientId);
		//now.sendScrollPosition(window.pageXOffset,window.pageYOffset);
	};
	
	now.receiveDrag = function () {
		
	}
	
	now.receiveExtra = function () {
		
	}
});