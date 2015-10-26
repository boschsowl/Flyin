'use strict';

// Get all modules needed
var express         = require('express'),
    bodyParser      = require('body-parser'),
    logger          = require('morgan'),
    _               = require('underscore'),
    session         =require('express-session'),
    mongoose        = require('mongoose'),
    shortid         = require('shortid');

// Set up
var app = express();
app.use(express.static('public'));
app.use(logger('combined')); // We want to log all non-static requests.
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Connect to MongoDB
var name = 'liuj16';
mongoose.connect('mongodb://localhost:27017/' + name);
var db = mongoose.connection;

// Set up Schemas
var User = require('./models/user');
var FlightPlan = require('./models/flightplan');

// Handle POST to create a user session (log in)
app.post('/v1/session', function(req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(400).send({ error: 'username and password required' });
    } else {
        var username = req.body.username;
        var password = req.body.password;
        User.find({'username': username, 'password': password },function(err){
            if(err){
                console.log('Invalid username or password');
                res.status(401).send({ error: 'Invalid username or password'});
            }
            else{
                res.status(201).send({
                    username:       username
                });
            }
        })
    }
});

// Handle POST to create a new user account (registration/sign in)
app.post('/v1/user', function(req, res) {
    var data = req.body;
    if (!data || !data.username || !data.password || !data.first_name || !data.last_name || !data.primary_email) {
        res.status(400).send({ error: 'username, password, first_name, last_name and primary_email required' });
    } else {
        //save to MongoDB
        var username = req.body.username;
        User.find({'username': username},function(err,userc){
            if(!err){
                res.status(400).send({ error: 'username already in use' });
            }
            else{
                data.created = Date.now();
                var newUser = new User({'username':data.username,'password':data.password,'first_name':data.first_name,'last_name':data.last_name,
                'dob':data.dob,'state':data.address_state,'city':data.address_city,'street':data.address_street,'zip':data.address_zip,
                    'primary_email':data.primary_email,'primary_phone':data.primary_phone});
                newUser.save(function(err){
                    if(err){
                        console.log("Error: " + err);
                    }
                    else{
                        console.log("New user:" + data.username);
                        res.status(201).send({username: data.username});
                    }
                });
            }
        })
    }
});

// Handle GET to fetch user information
app.get('/v1/user/:username', function(req, res) {
    var username = req.params.username;
    console.log(username);
    User.findOne({'username':username},function(err,user){
        console.log(user);
        if(err) {
            res.status(500).send({ error: 'Server problem'});
        }
        else if(!user){
            res.status(400).send({error: 'User is not found.'});
        }
        else{
            console.log("DEBUG: X",user);
            var data = [];
            var username = user.username;
            var password = user.password;
            var first_name = user.first_name;
            var last_name = user.last_name;
            var dob = user.dob;
            var address_state = user.state;
            var address_city = user.city;
            var address_street = user.street;
            var address_zip = user.zip;
            var primary_email = user.email;
            var primary_phone = user.phone;
            var plans = user.plans;
            plans.forEach(function(plan){
                FlightPlan.findOne({_id:plan},function(err, plan){
                    if(err){
                        return handleError(err);
                    }
                    else{
                        var date = plan.dept_time_proposed;
                        var from = plan.departure;
                        var to = plan.dst;
                        var planInfo = [date,from,to];
                        data.push(planInfo);
                    }
                })
            });
            //res.status(201).send(data);
            res.render('profile',{username:username, password: password, first_name:first_name,last_name: last_name,dob: dob,
            address_state:address_state,address_city: address_city, address_street: address_street, address_zip: address_zip,
            primary_email: primary_email, primary_phone: primary_phone});
        }
    });
});

// Handle POST to update an existing user account
app.post('/v1/edit', function(req,res){
    var data = req.body;
    if (!data || !data.password || !data.first_name || !data.last_name || !data.primary_email) {
        res.status(400).send({ error: 'password, first_name, last_name and primary_email required' });
    } else {
        //save to MongoDB
        var username = req.body.username;
        User.findOne({'username': username},function(err,user){
            if(err){
                res.status(400).send({ error: 'Unknown error'});
            }
            else{
                user.username = data.username;
                user.password = data.password;
                user.first_name = data.first_name;
                user.last_name = data.last_name;
                user.dob = data.dob;
                user.state = data.address_state;
                user.city = data.address_city;
                user.street = data.address_street;
                user.zip = data.address_zip;
                user.primary_email = data.primary_email;
                user.primary_phone = data.primary_phone;
                user.save();
            }
        })
    }
});

// Handle POST to create a new flight plan
app.post('/v1/plan', function(req, res) {
    var data = req.body;
    if (!data ||
        !data.type ||
        !data.ident ||
        !data.special_equip ||
        !data.true_airspeed ||
        !data.departure ||
        !data.dept_time_proposed ||
        !data.dept_time_actual ||
        !data.cruise_alt ||
        !data.route ||
        !data.dst ||
        !data.ete ||
        !data.remarks ||
        !data.fuel ||
        !data.alt_airports ||
        !data.name ||
        !data.num_aboard ||
        !data.color ||
        !data.dst_contact) {
        res.status(400).send({ error: 'all form fields required' });
    } else {
        //save to MongoDB
        var username = localStorage.getItem('username');
        var creator = User.findOne({'username':username});
        var newFlightPlan = new FlightPlan({'_creator':creator._id,'type':data.type, 'ident':data.ident,'special_equip':data.special_equip,
        'true_airspeed':data.true_airspeed,'departure':data.departure,'dept_time_proposed':data.dept_time_proposed,'dept_time_actual':data.dept_time_actual,
        'cruise_alt':data.cruise_alt,'route':data.route,'dst':data.dst,'ete':data.ete,'remarks':data.remarks,'fuel':data.fuel,'alt_airports':data.alt_airports,
        'name':data.name,'num_aboard':data.num_aboard,'color':data.color,'dst_contact':data.dst_contact,'status':'notcompleted'});

        newFlightPlan.save(function(err){
            if(err){
                console.log("Error: " + err);
                return handleError(err);
            }
            else{
                FlightPlan.find({})
                    .populate('_creator')
                    .exec(function(err, plan){
                       console.log(JSON.stringify(plan)) ;
                    });
                res.status(201).send("New flight plan created.");
            }
        });
    }
});

// Handle GET to fetch flight plan information
app.get('/v1/plan/:id', function(req, res) {
    var plan = _.findWhere(plans, { id: req.params.id.toLowerCase() });
    if (!plan) {
        res.status(404).send({ error: 'unknown flight plan' });
    } else {
        res.status(200).send(plan);
    }
});

// The review plan page should allow the user to delete/complete the existing plan.
app.delete('/v1/plan/delete',function(req,res){
    var ident = req.body.ident;
    FlightPlan.findOne({'ident': ident}).remove().exec();
});

// Add session support.  Use a simple configuration of the express-session module.
// Just use the default in-memory store.
// Have sessions expire after 30 days.
var sessionStore = new session.MemoryStore();
app.use(session({
    secret: "secret",
    store: sessionStore,
    expires: new Date(Date.now() + (30 * 86400 * 1000))
}))

var server = app.listen(8080, function () {
    console.log('Example app listening on ' + server.address().port);
});