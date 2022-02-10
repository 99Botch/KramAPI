// import mongoose package
const mongoose = require('mongoose');

// a schema is the representation of an item (User, Deck, etc...) in the db
// each element can be given certain attributes, such as a max length (max) or if it is required or not for registration (required)
// the _id is generated automatically by mongo. Each user has a username, mail address, password, a date of creation and possibly a profile picture for the update function (refer to controller)
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        max: 99,
        min: 6
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6,
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 8
    },
    profile_pic_url: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
});

// export the schema as 'UserSchema' and all its information so that the controller can import it as 'Users'
module.exports = mongoose.model('User', UserSchema);