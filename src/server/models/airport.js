"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AirportSchema = new Schema({
    'type':               {type: String, required: true},
    'ident':              {type: String, unique: true, required: true},
    'date':               {type: Date},
    'region':             {type: String},
    'pos':                {type: [Number], index: '2dsphere'}
    /*
    * Mongo:
    * 2d: planar, flat x,y
    * 2d: spherical surface, flat x,y
    * haystack: tl;dl
    * */
});

AirportSchema.pre('save',function(next){
    next();
});

module.exports=mongoose.model('Airport',AirportSchema);