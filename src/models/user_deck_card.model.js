// REFER T USERS MODEL
const { array } = require('joi');
const mongoose = require('mongoose');


const UserDeckCardSchema = mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    deck_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    card_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    last_review: {
        type: String,    
        _id: {
            required: false
        },
    },
    review_laspe: {
        type: String,        
        required: true
    },
    fail_counter: {
        type: Number,
        required: true
    },
    ease_factor: {
        type: Number,
        required: true,
    },
    is_new: {
        type: Boolean,
        required: true,
    },
    style_id: {
        type: mongoose.ObjectId,
        _id: {
            required: false
        },
    }
});


module.exports = mongoose.model('UserDeckCard', UserDeckCardSchema);