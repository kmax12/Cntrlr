/**
 * @author max kanter
 */

function Scroller (element) {
	self = this;
	self.element = (element) ? element : window;
	self.$element =  $(self.element);
	
	self.currentx = self.$element.scrollLeft();
	self.currenty = self.$element.scrollTop();
	self.vx = 0;
	self.vy = 0;
	
	self.friction = .001;
	
	isScrolling = false;
	
	console.log('currentx: ' + self.currentx + 'currenty: ' + self.currenty);
}

Scroller.prototype = {
	updatePos : function (dx,dy){
		self.currentx+=dx;
		self.currenty+=dy
		console.log('vx: ' + self.vx + 'vy: ' + self.vy);
		self.$element[0].scroll(self.currentx,self.currenty) //using vanilla js here instead of jQuery's scrolling functions
	}, 
	handleInput: function (dx,dy) {
		self.isScrolling = true;
		//console.log('dx:' + dx + 'dy:' + dy);
		updatePos(dx,dy)
	},
	handleExtra: function (speedx,speedy) {
		//&& self.$element.scrollLeft() !== 0 && self.$element.scrollLeft() !== self.$element.width()
		//&& self.$element.scrollTop() !== 0 && self.$element.scrollTop() !== self.$element.height()
		//self.vx = (self.vx>self.friction) ? self.vx - self.friction : 0;
		//self.vy = (self.vy>self.friction ) ? self.vy- self.friction : 0;
		
		self.updatePos(speedx,speedy);
		
		if (speedx<10) {
			speedx = 0;
		} else if (speedy<10) {
			speedy = 0;
		}
		
		if (speedx>0 || speedy>0) {
			setTimeout(handleExtra, 50)
		}
		
	}	
}
