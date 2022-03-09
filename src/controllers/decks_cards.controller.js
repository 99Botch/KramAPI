// const Deck  = require('../models/decks.model');
const Cards  = require('../models/cards.model');
const DeckCards  = require('../models/deck_card.model');

// ADD CARD TO DECK
module.exports.addCard = addCard = async (req, res, next) => {    
    let [user_id, card_id, deck_id] = [req.params.id, req.body.card_id, req.body.deck_id] || {};

    if (user_id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        await Promise.all([
            DeckCards.findOne({ deck_id: deck_id }),
            DeckCards.findOne({
                $and: [{ deck_id: deck_id }, { card_ids: card_id }]
            }),
            Cards.findOne({ _id: card_id }),
        ])
        .then( async ([ deck, cardUniqueness, cardExists ]) => {

            if(deck === null || !deck) return res.status(404).json("Error | Deck not found !");
            if(cardUniqueness) return res.status(404).json("Error | Don't duplicate cards !");
            if(cardExists === null || !cardExists) return res.status(404).json("Error | Card not found !");


            try{
                const addedCard = await DeckCards.updateOne(
                    { deck_id: deck_id }, 
                    { $push: { card_ids: card_id }}
                )
                return res.status(200).json(addedCard);
            } catch(err) { return res.status(400).json({message: err}) }
        })

    } catch(err) { res.status(400).json({message: "Error | Deck is not found or card duplicate !"}) }
}


// REMOVE CARD FROM DECK

module.exports.deleteDeckCards = deleteDeckCards = async (req, res, next) => {    
    let [user_id, card_id, deck_id] = [req.params.id, req.body.card_id, req.body.deck_id] || {};

    if (user_id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        await Promise.all([
            DeckCards.findOne({ deck_id: deck_id }),
            DeckCards.findOne({ card_ids: card_id }),
        ])
        .then( async ([ deck, card ]) => {

            if(deck === null || !deck) return res.status(404).json("Error | Deck not found !");
            if(card === null || !card) return res.status(404).json("Error | Card not found !");

            try{
                const deleteCard = await DeckCards.updateOne(
                    { deck_id: deck_id }, 
                    { $pull: { card_ids: card_id }}
                )
                return res.status(200).json(deleteCard);
            } catch(err) { return res.status(400).json({message: err}) }
        })

    } catch(err) { res.status(400).json({message: "Error | Deck is not found or card duplicate !"}) }
}
