const mongoose = require('mongoose')
const validator = require('validator')
const mealsplan = require('./mealsplan')

const daySchema = new mongoose.Schema({
    day : {
        type : String,
        unique: true
    },
    cost : Number,
    meals : [
        { type : mongoose.Schema.Types.ObjectId, ref:'mealsplan'}
    ]
});

const Days = new mongoose.model("Day",daySchema);

module.exports = Days;