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
