const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/miniproject');

const userSchema = new mongoose.Schema({
    name:String,
    username:String,
    agr:Number,
    email:String,
    password:String,
    posts: [{type: mongoose.Schema.Typesype.ObjectId, ref: "post" }]
})


module.exports = mongoose.model('users', userSchema);