const mongoose = require('mongoose')
const validator = require('validator')

const ingredientsSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    }
});

const Ingredient = new mongoose.model("Ingredient",ingredientsSchema);

module.exports = Ingredient;