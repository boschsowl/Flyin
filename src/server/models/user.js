"use strict"

var crypto  = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');

function gravatarHash(address){
    if(!address) return '';
    var hash = address.replace(/^\s\s*/,'').replace(/\s\s*$/,'');
    hash = hash.toLocaleLowerCase();
    return crypto.createHash('md5').update(hash).digest('hex');
};

var UserSchema = new Schema({
    _id:                 {type: String, unique: true, 'default': shortid.generate},
    'plans':            [{type: Schema.Types.ObjectId, ref: 'FlightPlan'}],
    'username':         {type: String, unique: true, required: true },
    'password':         {type: String, required:true},
    'first_name':       {type: String, default: '' },
    'last_name':        {type: String, default: ''},
    'dob':               {type: String, default: ''},
    'state':            {type: String, default: ''},
    'city':             {type: String, default: ''},
    'street':           {type: String, default: ''},
    'zip':              {type: String, default: ''},
    'email':            {type: String, default:''},
    'phone':            {type: String, default: ''},
    'created':          {type: Date},
    'status':           {type: String, default:'Active'}
});

UserSchema.pre('save',function(next){
    next();
});

module.exports=mongoose.model('User',UserSchema);