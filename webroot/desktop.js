var cntrlrClickCalled = false;
$(function () {
	$("head").append("<link href='http://localhost:8082/static/desktop.css' rel='stylesheet' />");
	$("body").addClass('cntrlr-enabled');
	$("body").append('<div id="cntrlr-cursor"></div>');
	$("body").bind("mousemove", function (event) {
		$("#cntrlr-cursor").hide(); $("#cntrlr-cursor").css({ top: (event.clientY) + "px", left: (event.clientX) + "px" });
	});
	// $("body").bind("mousedown", function (event) {
	// 	// $("#cntrlr-cursor").css({ left: "+=20px" });
	// 	// $("#cntrlr-cursor").hide();
	// });
	// $("body").bind("mouseup", function (event) {
	// 	console.log(event.target);
	// 	$("#cntrlr-cursor").show();
	// });
	$("body").bind("click", function (event) {
		if(!cntrlrClickCalled) {
			$("#cntrlr-cursor").hide();
			cntrlrClickCalled = true;
			// $("body").removeClass('cntrlr-enabled');
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
			// document.elementFromPoint(event.clientX, event.clientY).fireEvent('onclick', event);
			// event.initEvent('click', true, true);
			// document.elementFromPoint(event.clientX, event.clientY).dispatchEvent(event);
			// cntrlrSimulateEvent(document.elementFromPoint(event.clientX, event.clientY), 'focus');
			// $(document.elementFromPoint(event.clientX, event.clientY)).focus();
			// $("body").addClass('cntrlr-enabled');
			cntrlrClickCalled = false;
			$("#cntrlr-cursor").show();
		}
		return true;
	});
	
	// $("body").bind("cntrlr.click", function (event) {
	// 	if (document.createEvent) {
	//        // dispatch for firefox + others
	//        var evt = document.createEvent("HTMLEvents");
	//        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
	//        return !element.dispatchEvent(evt);
	//    } else {
	//        // dispatch for IE
	//        var evt = document.createEventObject();
	//        return element.fireEvent('on'+event,evt)
	//    }
	// });
	
	$("#js").click(function () { alert("hi"); return false; });
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
		console.log(trigger);
        element.dispatchEvent(trigger);
    }
}