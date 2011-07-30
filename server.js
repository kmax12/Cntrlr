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
   fs.readFile(WEBROOT+'index.html', function (err, data) {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write(data);
        response.end();
    });
});
//Define route for a mobile
server.get('/mobile', function (req, response) {
    fs.readFile(WEBROOT+'mobile.html', function (err, data) {
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

everyone.now.sendDrag = function (dx, dy) {
    everyone.now.receiveDrag(dx, dy)
}

everyone.now.sendExtra = function (speedx, speedy) {
    everyone.now.receiveExtra(speedx, speedy)
}