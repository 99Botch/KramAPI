/*
    Refer to users.model.js for more explantations
*/

const mongoose = require('mongoose');

const DeckCardsSchema = mongoose.Schema({
    deck_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    card_ids: [{
        type: mongoose.ObjectId,
        _id: {
            required: false
        },
    }],
});

module.exports = mongoose.model('DeckCards', DeckCardsSchema);
