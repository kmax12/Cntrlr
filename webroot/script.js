/**
 * @author max kanter
 */
var scroller,oldx,oldy,newx,newy;
var isDragging = false;
$(window).ready(function(){
	scroller = new Scroller();
})

now.ready(function(){
	now.recieveDrag = function (dx,dy) {
		console.log(dx + ':' + dy);
		scroller.handleInput(dx,dy);
	}
	
	now.recieveExtra= function (speedx,speedy) {
		scroller.handleExtra(speedx,speedy);
	}
});



