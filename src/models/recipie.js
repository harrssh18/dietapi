const mongoose = require('mongoose')
const validator = require('validator')
const Ingredient = require('./model')

const RecipieSchema = new mongoose.Schema({
    name : {
        type : String
    },
    desc : String,
    img : String,
    ingredient : [
        { type : mongoose.Schema.Types.ObjectId, ref:'Ingredient'}
    ]
});

const Recipie = new mongoose.model("Recipie",RecipieSchema);

module.exports = Recipie;