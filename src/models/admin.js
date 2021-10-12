const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    username : {
        type : String,
        unique: true
    },
    email : {
        type : String,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 8
    }
});

adminSchema.methods.generateAuthToken = async function(){
    try {
        const tk = jwt.sign({_id:this._id.toString()},"thisisahealthydietwebsite");
        return tk;
    } catch (error) {
        console.log(error);
    }
}

adminSchema.pre("save",async function(next){
    if(this.isModified("password"))
    {
        const passhash =await bcrypt.hash(this.password,10);
        this.password = passhash;
    }
    next();
});

const Admin = new mongoose.model("Admin",adminSchema);

module.exports = Admin;