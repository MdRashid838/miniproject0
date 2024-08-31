const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date : {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('users', userSchema);