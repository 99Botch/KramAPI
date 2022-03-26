// REFER T USERS MODEL
const mongoose = require('mongoose');

const DeckSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: 99,
        min: 6
    },
    category: {
        type: String,
        required: true,
    },
    private: {
        type: Boolean,
        required: true,
    },
    description: {
        type: String,
        max: 500,
        min: 5
    },
    added_date: {
        type: Date,
        default: Date.now
    },
    last_update: {
        type: Date,
        default: Date.now
    },
    deck_style_id: {
        type: mongoose.ObjectId,
        _id: {
            required: false
        },
    },
    votes: {
        type: Number
    },
    voters: [{
        voter_id: {
            type: mongoose.ObjectId,
            required: true,
        },
        vote: { 
            type: String
        },
        _id: { required: false },
    }],
});


module.exports = mongoose.model('Deck', DeckSchema);