// REFER T USERS MODEL
const { array } = require('joi');
const mongoose = require('mongoose');


const UserDeckCardsSchema = mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    deck_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    cards: [{
        card_id: {
            type: mongoose.ObjectId,
        },
        last_review: {
            type: String,    
            _id: {
                required: false
            },
        },
        review_lapse: {
            type: String,        
        },
        fail_counter: {
            type: Number,
        },
        ease_factor: {
            type: Number,
        },
        is_new: {
            type: Boolean,
        },
        style_id: {
            type: mongoose.ObjectId,
            _id: {
                required: false
            },
        }
    }]
});

module.exports = mongoose.model('UserDeckCards', UserDeckCardsSchema);
