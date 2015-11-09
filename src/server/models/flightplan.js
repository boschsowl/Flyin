"use strict"

var crypto  = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var FlightPlanSchema = new Schema({
    _id:                 {type: String, unique: true, 'default': shortid.generate},
    _creator:           {type: Schema.Types.ObjectId, ref: 'User'},
    'type':             {type: String, default: ''},
    'ident':                 {type: String, required: true},
    'special_equip':        {type: String, default: ''},
    'true_airspeed':        {type: String, default: ''},
    'departure':            {type: String, required: true},
    'dept_time_proposed':   {type: String, default:''},
    'dept_time_actual':     {type: String, default: ''},
    'cruise_alt':            {type: String, default: ''},
    'route':                  {type: String, default: ''},
    'dst':                    {type: String, required: true},
    'ete':                    {type: String, default: ''},
    'remarks':                {type: String, default: ''},
    'fuel':                   {type: String, default: ''},
    'alt_airports':          {type: String, default: ''},
    'name':                   {type: String, default: ''},
    'num_aboard':            {type: String, default: ''},
    'color':                  {type: String, default: ''},
    'dst_contact':           {type: String, default: ''},
    'status':                {type: String, default:'notcompleted'}
});

FlightPlanSchema.pre('save',function(next){
    next();
});

module.exports=mongoose.model('FlightPlan',FlightPlanSchema);