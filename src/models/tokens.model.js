// import mongoose package
const mongoose = require('mongoose');

// a schema is the representation of an item (User, Deck, etc...) in the db
// each element can be given certain attributes, such as a max length (max) or if it is required or not for registration (required)
// the _id is generated automatically by mongo. Each user has a username, mail address, password, a date of creation and possibly a profile picture for the update function (refer to controller)
const TokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
});

// export the schema as 'UserSchema' and all its information so that the controller can import it as 'Users'
module.exports = mongoose.model('Token', TokenSchema);