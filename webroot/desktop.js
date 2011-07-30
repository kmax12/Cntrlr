(function () {

  var socket;
  var closures = {};
  var nowReady = false;
  var readied = 0;
  var lastTimeout;
  var uri = '//localhost:8082';

  var fqnMap = {
    data: {},

    get: function (fqn) {
      return fqnMap.data[fqn];
    },

    set: function (fqn, val) {
      var lastIndex = fqn.lastIndexOf('.');
      var parent = fqn.substring(0, lastIndex);
      if (parent && !util.isArray(fqnMap.data[parent])) {
        fqnMap.set(parent, []);
      }
      if (parent && fqnMap.data[fqn] === undefined)
        fqnMap.data[parent].push(fqn.substring(lastIndex + 1));
      return fqnMap.data[fqn] = val;
    },

    deleteVar: function (fqn) {
      var lastIndex = fqn.lastIndexOf('.');
      var parent = fqn.substring(0, lastIndex);

      if (util.hasProperty(fqnMap.data, parent)) {
        // Remove from its parent.
        fqnMap.data[parent].splice(
          util.indexOf(fqnMap.data[parent], fqn.substring(lastIndex + 1)),
          1);
      }

      if (util.isArray(fqnMap.data[fqn])) {
        for (var i = 0; i < fqnMap.data[fqn].length; i++) {
          // Recursive delete all children.
          fqnMap.deleteVar(fqn + '.' + fqnMap.data[fqn][i]);
        }
      }
      delete fqnMap.data[fqn];
    }
  };

  var util = {
    _events: {},
    // Event code from socket.io
    on: function (name, fn) {
      if (!(util.hasProperty(util._events, name))) {
        util._events[name] = [];
      }
      util._events[name].push(fn);
      return util;
    },

    indexOf: function(arr, val) {
      for(var i = 0, ii = arr.length; i < ii; i++){
        if(arr[i] == val){
          return i;
        }
      }
      return -1;
    },

    emit: function (name, args) {
      if (util.hasProperty(util._events, name)) {
        var events = util._events[name].slice(0);
        for (var i = 0, ii = events.length; i < ii; i++) {
          events[i].apply(util, args === undefined ? [] : args);
        }
      }
      return util;
    },
    removeEvent: function (name, fn) {
      if (util.hasProperty(util._events, name)) {
        for (var a = 0, l = util._events[name].length; a < l; a++) {
          if (util._events[name][a] == fn) {
            util._events[name].splice(a, 1);
          }
        }
      }
      return util;
    },

    hasProperty: function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(Object(obj), prop);
    },
    isArray: Array.isArray || function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },

    createVarAtFqn: function (scope, fqn, value) {
      var path = fqn.split('.');
      var currVar = util.forceGetParentVarAtFqn(scope, fqn);
      currVar[path.pop()] = value;
    },

    forceGetParentVarAtFqn: function (scope, fqn) {
      var path = fqn.split('.');
      path.shift();

      var currVar = scope;
      while (path.length > 1) {
        var prop = path.shift();
        if (!util.hasProperty(currVar, prop)) {
          if (!isNaN(path[0])) {
            currVar[prop] = [];
          } else {
            currVar[prop] = {};
          }
        }
        currVar = currVar[prop];
      }
      return currVar;
    },

    getVarFromFqn: function (scope, fqn) {
      var path = fqn.split('.');
      path.shift();
      var currVar = scope;
      while (path.length > 0) {
        var prop = path.shift();
        if (util.hasProperty(currVar, prop)) {
          currVar = currVar[prop];
        } else {
          return false;
        }
      }
      return currVar;
    },

    generateRandomString: function () {
      return Math.random().toString().substr(2);
    },

    getValOrFqn: function(val, fqn) {
      if (typeof val === 'function') {
        if (val.remote) {
          return undefined;
        }
        return {fqn: fqn};
      } else {
        return val;
      }
    },

    watch: function (obj, label, fqn) {
      var val = obj[label];

      function getter () {
        return val;
      };
      function setter (newVal) {
        if (val !== newVal) {
          // trigger some sort of change.
          if (val && typeof val === 'object') {
            fqnMap.deleteVar(fqn);
            lib.processScope(obj, fqn.substring(0, fqn.lastIndexOf('.')));
            return undefined;
          }
          val = newVal;
          if (newVal && typeof newVal === 'object') {
            fqnMap.deleteVar(fqn);
            lib.processScope(newVal, fqn);
            return undefined;
          }
          fqnMap.set(fqn, newVal);
          if (typeof newVal === 'function') {
            newVal = {fqn: fqn};
          }
          var obj = {};
          obj[fqn] = newVal;
          socket.emit('rv', obj);
        }
        return newVal;
      };
      if (Object.defineProperty) {
        Object.defineProperty(obj, label, {get: getter, set: setter});
      } else {
        if (util.getter) {
          obj.__defineGetter__(label, util.getter);
        }
        if (setter) {
          obj.__defineSetter__(label, setter);
        }
      }
    }
  };

  var now = {
    ready: function (func) {
      if (arguments.length === 0) {
        util.emit('ready');
      } else {
        if (nowReady) {
          func();
        }
        util.on('ready', func);
      }
    },
    core: {
      on: util.on,
      options: {},
      removeEvent: util.removeEvent,
      clientId: undefined
    }
  };

  // Needs to be easily configurable.
  window.now = now;

  var isIE = (function () {
    try {
      Object.defineProperty({}, '', {});
      return false;
    } catch (err) {
      return true;
    }
    return true;
  })();

  var lib = {

    deleteVar: function (fqn) {
      var path, currVar, parent, key;
      path = fqn.split('.');
      currVar = now;
      for (var i = 1; i < path.length; i++) {
        key = path[i];
        if (currVar === undefined) {
          // delete from fqnMap, just to be safe.
          fqnMap.deleteVar(fqn);
          return;
        }
        if (i === path.length - 1) {
          delete currVar[path.pop()];
          fqnMap.deleteVar(fqn);
          return;
        }
        currVar = currVar[key];
      }
    },

    replaceVar: function (data) {
      for (var fqn in data) {
        if (util.hasProperty(data[fqn], 'fqn')) {
          data[fqn] = lib.constructRemoteFunction(fqn);
        }
        util.createVarAtFqn(now, fqn, data[fqn]);
      }
    },

    remoteCall: function (data) {
      var func;
      // Retrieve the function, either from closures hash or from the now scope
      if (data.fqn.split('_')[0] === 'closure') {
        func = closures[data.fqn];
      } else {
        func = util.getVarFromFqn(now, data.fqn);
      }
      var args = data.args;

      if (typeof args === 'object' && !util.isArray(args)) {
        var newargs = [];
        // Enumeration order is not defined so this might be useless,
        // but there will be cases when it works
        for (var i in args) {
          newargs.push(args[i]);
        }
        args = newargs;
      }

      // Search (only at top level) of args for functions parameters,
      // and replace with wrapper remote call function
      for (var i = 0, ii = args.length; i < ii; i++) {
        if (util.hasProperty(args[i], 'fqn')) {
          args[i] = lib.constructRemoteFunction(args[i].fqn);
        }
      }
      func.apply({now: now}, args);
    },

    // Handle the ready message from the server
    serverReady: function() {
      nowReady = true;
      lib.processNowScope();
      if (++readied == 2)
        util.emit('ready');
    },

    constructRemoteFunction: function (fqn) {
      var remoteFn = function () {
        lib.processNowScope();
        var args = [];
        for (var i = 0, ii = arguments.length; i < ii; i++)
          args[i] = arguments[i];
        for (i = 0, ii = args.length; i < ii; i++) {
          if (typeof args[i] === 'function') {
            var closureId = 'closure_' + args[i].name + '_' + util.generateRandomString();
            closures[closureId] = args[i];
            args[i] = {fqn: closureId};
          }
        }
        socket.emit('rfc', {fqn: fqn, args: args});
      };
      remoteFn.remote = true;
      return remoteFn;
    },
    handleNewConnection: function (socket) {
      if (socket.handled) return;
      socket.handled = true;

      socket.on('rfc', function (data) {
        lib.remoteCall(data);
        util.emit('rfc', data);
      });
      socket.on('rv', function (data) {

        lib.replaceVar(data);
        util.emit('rv', data);
      });
      socket.on('del', function (data) {
        lib.deleteVar(data);
        util.emit('del', data);
      });

      // Handle the ready message from the server
      socket.on('rd', function(data){
        lib.serverReady();
      });

      socket.on('disconnect', function () {
        readied = 0;
        util.emit('disconnect');
      });
      // Forward planning for socket io 0.7
      socket.on('error', function () {
        util.emit('error');
      });
      socket.on('retry', function () {
        util.emit('retry');
      });
      socket.on('reconnect', function () {
        util.emit('reconnect');
      });
      socket.on('reconnect_failed', function () {
        util.emit('reconnect_failed');
      });
      socket.on('connect_failed', function () {
        util.emit('connect_failed');
      });
    },
    processNowScope: function () {
      lib.processScope(now, 'now');
      clearTimeout(lastTimeout);
      if (socket.socket.connected)
        lastTimeout = setTimeout(lib.processNowScope, 1000);
    },
    processScope: function (obj, path) {
      var data = {};
      lib.traverseScope(obj, path, data);
      // Send only for non-empty object
      for (var i in data) {

        if(util.hasProperty(data, i) && data[i] !== undefined) {

          socket.emit('rv', data);

          break;
        }
      }
    },
    traverseScope: function (obj, path, data) {
      if (obj && typeof obj === 'object') {
        var objIsArray = util.isArray(obj);
        var keys = fqnMap.get(path);

        for (var key in obj) {
          var fqn = path + '.' + key;
          var val = obj[key];

          if (fqn === 'now.core' || fqn === 'now.ready') {
            continue;
          }

          var type = typeof val;
          if (util.hasProperty(obj, key)) {
            if (isIE || objIsArray) {
                if(!(val && type === 'object') && fqnMap.get(fqn) !== val) {
                  fqnMap.set(fqn, val);
                  data[fqn] = util.getValOrFqn(val, fqn);
                }
            } else {
              if (fqnMap.get(fqn) === undefined) {
                util.watch(obj, key, fqn);
                if (type !== 'object' || !val) {
                  fqnMap.set(fqn, val);
                  data[fqn] = util.getValOrFqn(val, fqn);
                }
              }
            }
          }
          lib.traverseScope(val, fqn, data);
        }
        if (keys && typeof keys === 'object') {
          var toDelete = [];
          // Scan for deleted keys.
          for (var i = 0; i < keys.length; i++) {
            if (obj[keys[i]] === undefined) {
              toDelete.push(path + '.' + keys[i]);
              fqnMap.deleteVar(path + '.' + keys[i]);
            }
          }
          // Send message to server to delete from its database.
          if (toDelete.length > 0) {
            socket.emit('del', toDelete);
          }
        }
      }
    }
  };

  var dependencies = [
    { key: 'io', path: '/socket.io/socket.io.js'}
  ];
  var dependenciesLoaded = 0;

  var scriptLoaded = function () {
    dependenciesLoaded++;
    if (dependenciesLoaded !== dependencies.length) {
      return;
    }
    socket = io.connect(uri+'/', now.core.options.socketio || {});
    now.core.socketio = socket;
    socket.on('connect', function () {
      now.core.clientId = socket.socket.sessionid;
      lib.handleNewConnection(socket);
      // Begin intermittent scope traversal

      setTimeout(function(){
        lib.processNowScope();
        socket.emit('rd');
        if (++readied == 2)
          util.emit('ready');
      }, 100);

      util.emit('connect');
    });
    socket.on('disconnect', function () {
      // y-combinator trick
      (function (y) {
        y(y, now);
      })(function (fn, obj) {
        for (var i in obj) {
          if (obj[i] && typeof obj[i] === 'object' &&
              obj[i] != document && obj[i] !== now.core) {
            fn(fn, obj[i]);
          }
          else if (typeof obj[i] === 'function' && obj[i].remote) {
            delete obj[i];
          }
        }
      });

      // Clear all sorts of stuff in preparation for reconnecting.
      fqnMap.data = {};
    });
  };

  for (var i=0, ii=dependencies.length; i < ii; i++) {
    if (window[dependencies[i]['key']]) {
      scriptLoaded();
      return;
    }
    var fileref=document.createElement('script');
    fileref.setAttribute('type','text/javascript');
    fileref.setAttribute('src', uri+dependencies[i]['path']);
    fileref.onload = scriptLoaded;
    if (isIE) {
      fileref.onreadystatechange = function () {
        if (fileref.readyState === 'loaded' || fileref.readyState === 'complete' ) {
          scriptLoaded();
        }
      };
    }
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
})();

// ** OUR STUFF ** //

var scroller,oldx,oldy,newx,newy,
	isDragging = false,
	cntrlrClickCalled = false,
	cntrlrCanvasContext,
	cntrlrCanvasEnabled = false;
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
			// console.log(dx + " " + dy);
			if(cntrlrCanvasEnabled) {
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
			}
		}

		now.receiveMouseClick = function () {
			cntrlrClickCalled = true;
			elem = document.elementFromPoint($("#cntrlr-cursor").position().left, $("#cntrlr-cursor").position().top);
			if(elem != null) {
				if((elem.tagName == "INPUT" && elem.type.toLowerCase() != "submit" && elem.type.toLowerCase() != "checkbox" && elem.type.toLowerCase() != "radio") || elem.tagName == "TEXTAREA" || elem.tagName == "SELECT") {
					$(elem).click();
					$(elem).focus();
				} else {
					if(elem.tagName == "INPUT" && (elem.type.toLowerCase() == "checkbox" || elem.type.toLowerCase() == "radio")) {
						$(elem).click();
					} else {
						cntrlrSimulateEvent(elem, 'click');
					}
				}
			}
			cntrlrClickCalled = false;
			if(cntrlrCanvasEnabled) {
				cntrlrCanvasContext.strokeStyle = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
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