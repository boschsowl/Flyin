var mongoose        = require('mongoose'),
    shortid         = require('shortid'),
    geolib          = require('geolib'),
    path            = require('path'),
    redis;

// Set up Schemas
var User = require('./models/user');
var FlightPlan = require('./models/flightplan');
var Airport = require('./models/airport');

// Handle POST to create a user session (log in)
var login = function (req,res){
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
}

// Handle POST to create a new user account (registration/sign in)
var signin = function(req, res) {
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
                    // Cache to Redis
                    client.hmset(data.username,{'username':data.username,'password':data.password,'first_name':data.first_name,'last_name':data.last_name,
                        'dob':data.dob,'state':data.address_state,'city':data.address_city,'street':data.address_street,'zip':data.address_zip,
                        'primary_email':data.primary_email,'primary_phone':data.primary_phone
                    });
                    // Save to MongoDB
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
    };

var fetchUser = function(req, res) {
    var username = req.params.username;
    // Check Redis to see if there is a copy
    client.get(username,function(err,reply){
        if(err){
            console.log(err);
        }
        else if(reply){ // Found in cache
            var data = [];
            var username = reply.username;
            var password = reply.password;
            var first_name = reply.first_name;
            var last_name = reply.last_name;
            var dob = reply.dob;
            var address_state = reply.state;
            var address_city = reply.city;
            var address_street = reply.street;
            var address_zip = reply.zip;
            var primary_email = reply.email;
            var primary_phone = reply.phone;
            var plans = reply.plans;
            plans.forEach(function(plan){
                client.get(plan,function(err,plan){
                    if(err){
                        return handleError(Err);
                    }
                    else {
                        var date = plan.dept_time_proposed;
                        var from = plan.departure;
                        var to = plan.dst;
                        var planInfo = [date,from,to];
                        data.push(planInfo);
                    }
                });
            });
            res.render('profile',{username:username, password: password, first_name:first_name,last_name: last_name,dob: dob,
                address_state:address_state,address_city: address_city, address_street: address_street, address_zip: address_zip,
                primary_email: primary_email, primary_phone: primary_phone});
        }
        else{ // Not found in cache*/
            User.findOne({'username':username},function(err,user){
                if(err) {
                    res.status(500).send({ error: 'Server problem'});
                }
                else if(!user){
                    res.status(400).send({error: 'User is not found.'});
                }
                else{
                    client.hmset(username,{'username':user.username,'password':user.password,'first_name':user.first_name,'last_name':user.last_name,
                        'dob':user.dob,'state':user.address_state,'city':user.address_city,'street':user.address_street,'zip':user.address_zip,
                        'primary_email':user.primary_email,'primary_phone':user.primary_phone
                    });
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
                    res.render('profile',{username:username, password: password, first_name:first_name,last_name: last_name,dob: dob,
                        address_state:address_state,address_city: address_city, address_street: address_street, address_zip: address_zip,
                        primary_email: primary_email, primary_phone: primary_phone});
                }
            });
        }
    });

};

var edit = function(req,res){
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

                // Update cache
                client.hmset(username,data);
            }
        })
    }
};

var createPlan = function(req, res) {
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
        // Save to MongoDB
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

        // Cache to Redis
        var newFlightPlanId = newFlightPlan._id;
        client.hmset(newFlightPlanId,{'_creator':creator._id,'type':data.type, 'ident':data.ident,'special_equip':data.special_equip,
            'true_airspeed':data.true_airspeed,'departure':data.departure,'dept_time_proposed':data.dept_time_proposed,'dept_time_actual':data.dept_time_actual,
            'cruise_alt':data.cruise_alt,'route':data.route,'dst':data.dst,'ete':data.ete,'remarks':data.remarks,'fuel':data.fuel,'alt_airports':data.alt_airports,
            'name':data.name,'num_aboard':data.num_aboard,'color':data.color,'dst_contact':data.dst_contact,'status':'notcompleted'});
    }
};

var fetchPlan = function(req, res) {
    var plan = _.findWhere(plans, { id: req.params.id.toLowerCase() });
    if (!plan) {
        res.status(404).send({ error: 'unknown flight plan' });
    } else {
        res.status(200).send(plan);
    }
};

var deletePlan = function(req,res){
    var ident = req.body.ident;

    FlightPlan.findOne({'ident': ident},function(err,plan){
        if(err){
            return handleError();
        }
        if(plan){
            var planId = plan._id;
            client.remove(planId);
        }

    }).remove().exec();
};

var fetchTile = function(req,res){
    //console.log(req.query);
    var data = req.query;
    var x = data.x,
        y = data.y,
        z = data.z;
    res.sendFile( y+'.png',{ root: 'data/'+ z + '/' + x });
};
/*
* 1. Incoming request(lat/long/max)
* * airport_longs.js
 *   connect to mongo
 *   require airports.json
 *   require schema of airport
 *   each(airports, function(airport){
 *       new Airport(airport)
 *       save doc
 *       note: lat/long divided by 3600
 *             long needs to have a - in front of it b/c db is only for us airports
 *   })
* 2. Search MongoDB for lat/lng
* Airport.find({type: 'Airport',        // Get an array of airports
*               $near: {
*                   $geometry:{
*                       point
*                       coords:[long, lat]
*                   },
*               $maxdistance: 10000 in meteres
*               }})
*               use geolib to calc the closest airport
* - Sort on distance
* - Return closest + distance
* 3.
* */
var findAirport = function(req,res){
    var pos = req.query;
    var lat = pos.lat,
        long = pos.long,
        maxDist = pos.maxDist;
    Airport.find({type:'AIRPORT',
                pos: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [long, lat]
                        },
                        $maxDistance: 10000
                    }
                }
    },function(err,airports){
        if(err){
            console.log(err);
            res.status(404).send();
        }
        else{
            var minDist = 10000;
            var nearestAirport;
            airports.forEach(function(airport){
                var tmp = geolib.getDistance({latitude:lat,longitude:long},{latitude:airport.pos.latitude,longitude:airport.pos.longitude});
                if(tmp<minDist){
                    minDist = tmp;
                    nearestAirport = [airport.ident, minDist];
                }
            });
            res.status(200).send(nearestAirport);
        }
    });
};

module.exports = function(app, redisClient) {
    redis = redisClient;
    app.post('/v1/session', login);
    app.post('/v1/user',signin);
    app.get( '/v1/user:username',fetchUser);
    app.post('/v1/edit', edit);
    app.post('/v1/plan', createPlan);
    app.get('v1/plan/:id',fetchPlan);
    app.delete('/v1/plan/delete',deletePlan);
    app.get('/v1/tile',fetchTile);
    app.get('/v1/airport',findAirport);
};