/**
 * @author max kanter
 */
var scroller,oldx,oldy,newx,newy;
var isDragging = false;
$(window).ready(function(){
	scroller = new Scroller();
})

now.ready(function(){
	now.receiveDrag = function (dx,dy) {
		scroller.handleInput(dx,dy);
	}
	
	now.receiveExtra= function (speedx,speedy) {
		scroller.handleExtra(speedx,speedy);
	}
	
	now.receiveMouseMove = function (dx, dy) {
		$("#cntrlr-cursor").hide(); $("#cntrlr-cursor").css({ top: (event.clientY < 0 ? "-=" : "+=") + Math+ "px", left: (event.clientX) + "px" });
	}
	
	now.receiveMouseClick = function () {
		
	}
});



