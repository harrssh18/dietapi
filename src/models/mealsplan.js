const mongoose = require('mongoose')
const validator = require('validator')
const Recipie = require('./recipie')

const MealsPlanSchema = new mongoose.Schema({
    name : String,
    break_fast : [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Recipie'}
    ],
    morning_snacks : [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Recipie'}
    ],
    lunch : [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Recipie'}
    ],
    afternoon_snacks : [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Recipie'}
    ],
    dinner : [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Recipie'}
    ]

});

const MealsPlan = new mongoose.model("MealsPlan",MealsPlanSchema);

module.exports = MealsPlan;