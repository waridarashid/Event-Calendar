
// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/appointment', {useMongoClient: true});
// mongoose.connection.on('error', function(){});

// Express
var app = express();

app.use(express.static(__dirname + './../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./api/appointment/'));

// Start server
var port = 8080;
var ip = "127.0.0.1";

var server = app.listen(port, ip, function() {
  console.log('Express server listening on %d', port);
});

var io = require('socket.io')(server);

server.on('request', function (req, res) {
	// Tell all clients to update
	if (req.method != 'GET') {
		io.sockets.emit('broadcast', "this is a broadcast alert");
	}
});