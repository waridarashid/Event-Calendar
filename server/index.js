
// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// MongoDB

mongoose.connect('mongodb://localhost/appointment');
// mongoose.connection.on('error', function(){});

// Express
var app = express();

app.use(express.static(__dirname + './../public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./api/appointment/'));

// Start server
var port = 8080
, ip = "127.0.0.1";
app.listen(port, ip, function() {
  console.log('Express server listening on %d', port);
});
