'use strict';

// Get all modules needed
var express         = require('express'),
    bodyParser      = require('body-parser'),
    logger          = require('morgan'),
    _               = require('underscore'),
    mongoose        = require('mongoose'),
    redis           = require('redis'),
    session         =require('express-session'),
    path            =require('path');


// Connect to MongoDB
var name = 'liuj16';
mongoose.connect('mongodb://localhost:27017/' + name);
var db = mongoose.connection;

// Connect to Redis
var client = redis.createClient("redis://192.168.99.100:32768");

// Set up
var app = express();
app.use(express.static('public'));
app.use(logger('combined')); // We want to log all non-static requests.
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
//app.set('views', __dirname + '/views');
app.set('views',path.join(__dirname + '../../views'));
app.set('view engine', 'jade');

var ctrl = require("./controller")(app, client);

// Add session support.  Use a simple configuration of the express-session module.
// Just use the default in-memory store.
// Have sessions expire after 1 day.
var sessionStore = new session.MemoryStore();
app.use(session({
    secret: "secret",
    store: sessionStore,
    expires: new Date(Date.now() + (1 * 86400 * 1000))
}))

// Start listening!
var server = app.listen(8080, function () {
    console.log('Example app listening on ' + server.address().port);
});