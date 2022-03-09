// REFER T USERS MODEL
const { array } = require('joi');
const mongoose = require('mongoose');


const DeckSchema = mongoose.Schema({
    creator_id: {
        type: mongoose.ObjectId,
        required: true,
    },
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
    votes: [{      
        voter_id: {
            type: mongoose.ObjectId,
        },
        vote: {
            type: String
        },
        _id: {
            required: false
        },
    }]
});


module.exports = mongoose.model('Deck', DeckSchema);