// REFER T USERS MODEL
const mongoose = require('mongoose');

const UserCardSchema = mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    cards: [{
        card_id: {
            type: mongoose.ObjectId,
        },
        next_session: {
            type: String,    
        },
        interval: {
            type: Number,        
        },
        fail_counter: {
            type: Number,
        },
        old_ease_factor: {
            type: Number,
        },
        ease_factor: {
            type: Number,
        },
        success_streak: {
            type: Number,
        },
        style_id: {
            type: mongoose.ObjectId,
        },
        _id: {
            required: false
        },
    }]
});

module.exports = mongoose.model('UserCard', UserCardSchema);
