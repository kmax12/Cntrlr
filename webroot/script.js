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
		console.log(dx + " " + dy);
		$("#cntrlr-cursor").css({ top: (dy < 0 ? "-=" : "+=") + Math.abs(dy) + "px", left: (dx < 0 ? "-=" : "+=") + Math.abs(dx) + "px" });
		if($("#cntrlr-cursor").position().left < 10) {
			$("#cntrlr-cursor").css({ left: 10 });
		}
		if($("#cntrlr-cursor").position().left >= ($(window).width() - 10)) {
			$("#cntrlr-cursor").css({ left: $(window).width() - 10 });
		}
		if($("#cntrlr-cursor").position().top < 10) {
			$("#cntrlr-cursor").css({ top: 10 });
		}
		if($("#cntrlr-cursor").position().top >= ($(window).height() - 10)) {
			$("#cntrlr-cursor").css({ top: $(window).height() - 10 });
		}
	}
	
	now.receiveMouseClick = function () {
		cntrlrClickCalled = true;
		elem = document.elementFromPoint($("#cntrlr-cursor").position().left, $("#cntrlr-cursor").position().top);
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
	}
});

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
