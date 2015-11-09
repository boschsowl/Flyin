/* * airport_longs.js
*   connect to mongo
*   require airports.json
*   require schema of airport
*   each(airports, function(airport){
    *       new Airport(airport)
    *       save doc
    *       note: lat/long divided by 3600
    *             long needs to have a - in front of it b/c db is only for us airports
    *   })
*/

var mongoose = require('mongoose');
var airports = require('./apt');
var Airport = require('./models/airport');

airports.forEach(function(airport){
    var airport = new Airport({
       'type': airport.type,
       'ident': airport.ident,
       'date': airport.date,
       'region': airport.region,
       'pos': [(airport.latitudeSec)/3600,-1*(airport.longitudeSec/3600)]
    });
    airport.save(function(err){
        console.log(airport.ident);
        console.log(err);
    });
});