/*
    Refer to users.model.js for more explantations
*/

const mongoose = require('mongoose');

const SessionsSchema = mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Sessions', SessionsSchema);