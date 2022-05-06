/*
    Refer to users.model.js for more explantations
*/

const mongoose = require('mongoose');

const CardSchema = mongoose.Schema({
    creator_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    img_url: {
        type: String,
    },
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    fail_counter: {
        type: Number
    },
    next_session: {
        type: String
    },
    interval: {
        type: Number
    },
});

module.exports = mongoose.model('Card', CardSchema);