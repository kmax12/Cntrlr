var http = require('http'),
express = require("express"),
nowjs = require("now"),
fs = require('fs'),
path = require('path'),
WEBROOT = path.join(path.dirname(__filename), '/webroot');


//Create express server
var server = express.createServer();

server.use('/static',express.static(WEBROOT));

//Define route for the homepage
server.get('/', function (req, response) {
   fs.readFile(WEBROOT+'/index.html', function (err, data) {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write(data);
        response.end();
    });
});
//Define route for a mobile
server.get('/mobile', function (req, response) {
    fs.readFile(WEBROOT+'/mobile/index.html', function (err, data) {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write(data);
        response.end();
    });
});

server.get('/s/*', function (req, res) {
  
});
server.listen(8082);

var everyone = nowjs.initialize(server);

everyone.on('connect', function() {
    var group = nowjs.getGroup(this.now.cntrlr);
    group.addUser(this.user.clientId);
});

everyone.on('disconnect', function() {
    var group = nowjs.getGroup(this.now.cntrlr);
	group.removeUser(this.user.clientId);
});

everyone.now.sendDrag = function (dx, dy) {
    nowjs.getGroup(this.now.cntrlr).now.receiveDrag(dx, dy)
}

everyone.now.sendExtra = function (speedx, speedy) {
    nowjs.getGroup(this.now.cntrlr).now.receiveExtra(speedx, speedy)
}

everyone.now.sendMouseMove = function (dx, dy) {
    nowjs.getGroup(this.now.cntrlr).now.receiveMouseMove(dx, dy);
}

everyone.now.sendMouseClick = function () {
    nowjs.getGroup(this.now.cntrlr).now.receiveMouseClick();
}

everyone.now.sendEnableCanvas = function () {
    nowjs.getGroup(this.now.cntrlr).now.receiveEnableCanvas();
}

everyone.now.sendDisableCanvas = function () {
    nowjs.getGroup(this.now.cntrlr).now.receiveDisableCanvas();
}

everyone.now.sendButtonCall = function (n) {
    nowjs.getGroup(this.now.cntrlr).now.receiveButtonCall(n);
}


everyone.now.sendButtonSetup = function (n) {
	if (n==1) {
		elem1 = null;
	} else if (n==2) {
		elem2 = null;
	}
    nowjs.getGroup(this.now.cntrlr).now.receiveButtonSetup(n);
}

everyone.now.sendButtonSuccess = function (n) {
    nowjs.getGroup(this.now.cntrlr).now.receiveButtonSuccess(n);
}

everyone.now.sendMakeTextInput = function (current) {
	nowjs.getGroup(this.now.cntrlr).now.receiveMakeTextInput(current);
}

everyone.now.sendTextInput = function (text) {
	nowjs.getGroup(this.now.cntrlr).now.receiveTextInput(text);
}