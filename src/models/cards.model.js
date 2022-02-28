// REFER T USERS MODEL
const { array } = require('joi');
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
    }
});


module.exports = mongoose.model('Card', CardSchema);